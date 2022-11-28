use futures::stream::TryStreamExt;
use std::collections::HashMap;
use mongodb::{ options::ClientOptions, options::FindOptions, Client };
use mongodb::bson::{ doc };
use serde::{ Deserialize, Serialize };
use dotenv::dotenv;
use chrono::prelude::*;
use chrono::{ Utc };

pub async fn calculate(out_path: String) -> mongodb::error::Result<()> {
    dotenv().ok();
    // Define env variables
    let mongodb_connection = std::env
        ::var("MONGODB_CONNECTION")
        .expect("failed to find mongodb connection");
    let database_name = std::env::var("MONGODB_DB").expect("failed to find mongodb database");
    // Define structs
    #[derive(Debug, Serialize, Deserialize)]
    struct Stat {
        data_uri: String,
        timestamp_request: String,
        timestamp_start: String,
        timestamp_end: String,
        value: String,
        collateral: String,
    }
    #[derive(Debug, Serialize, Deserialize)]
    struct GlobalStats {
        kind: String,
        count: i64,
    }
    #[derive(Debug, Serialize, Deserialize)]
    struct DailyStat {
        day: String,
        count: i64,
    }
    // Parse your connection string into an options struct
    let mut client_options = ClientOptions::parse(mongodb_connection).await?;
    // Manually set an option
    client_options.app_name = Some("Retriev Status Daemon".to_string());
    // Get a handle to the cluster
    let client = Client::with_options(client_options)?;
    // Connect to database and take the collection
    client.database("admin").run_command(doc! { "ping": 1 }, None).await?;
    println!("Starting working on deals..");
    let db = client.database(&database_name);
    let deals = db.collection::<Stat>("deals");
    // TODO: Add a better filter with timestamp > (now-30days) instead of limit
    let mut _deals_cursor = deals.find(
        doc! { "timestamp_start": {"$ne": "" } },
        FindOptions::builder()
            .sort(doc! { "timestamp_start": 1 })
            // Change this parameter to analyze more than 30 days
            .limit(60 * 24 * 30)
            .build()
    ).await?;
    // Build raw datas
    let raw_data: Vec<_> = _deals_cursor.try_collect().await?;
    println!("-> Found {} deals to process.", raw_data.len());
    // Instantiate working variables
    let mut counters_per_cid = HashMap::new();
    let mut total_counter: i64 = 0;
    let mut total_value: i64 = 0;
    let mut total_collateral: i64 = 0;
    let mut global_stats: Vec<GlobalStats> = Vec::new();
    for i in 0..raw_data.len() {
        total_counter = total_counter + 1;
        let timestamp_u64 = raw_data[i].timestamp_start.to_string().parse::<i64>().unwrap() / 1000;
        let dt = Utc.timestamp_opt(timestamp_u64, 0).unwrap().to_string();
        let _split_date: Vec<&str> = dt.split(" ").collect();
        let count = counters_per_cid.entry(raw_data[i].data_uri.to_string()).or_insert(0);
        *count += 1;
        total_collateral += raw_data[i].collateral.parse::<i64>().unwrap();
        total_value += raw_data[i].value.parse::<i64>().unwrap();
    }
    println!("--> Parsed {} deals", total_counter);
    println!("--> Total collateral is {} wei", total_collateral);
    println!("--> Total value is {} wei", total_value);
    // Packing general stats
    global_stats.push(GlobalStats { kind: "total_deals".to_string(), count: total_counter });
    global_stats.push(GlobalStats { kind: "total_collateral".to_string(), count: total_collateral });
    global_stats.push(GlobalStats { kind: "total_value".to_string(), count: total_value });
    // Write static file into disk
    println!("--> Writing files into disk..");
    std::fs::write(
        out_path.clone() + &"deals/global.json".to_owned(),
        serde_json::to_string_pretty(&global_stats).unwrap()
    )?;
    println!("--> Task completed");
    Ok(())
}