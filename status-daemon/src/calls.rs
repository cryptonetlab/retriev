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
        msg: String,
        details: String,
        timestamp: f64,
        referee: String,
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
    println!("Starting working on calls..");
    let db = client.database(&database_name);
    let activities = db.collection::<Stat>("activities");
    // TODO: Add a better filter with timestamp > (now-30days) instead of limit
    let mut _activities_cursor = activities.find(
        doc! { "msg": {"$ne": "PING"} },
        FindOptions::builder()
            .sort(doc! { "timestamp": -1 })
            // Change this parameter to analyze more than 30 days
            .limit(60 * 24 * 30)
            .build()
    ).await?;
    // Build raw datas
    let raw_data: Vec<_> = _activities_cursor.try_collect().await?;
    println!("-> Found {} activities messages.", raw_data.len());
    // Instantiate working variables
    let mut retrievals = HashMap::new();
    let mut appeals = HashMap::new();
    let mut parsed_retrievals: Vec<DailyStat> = Vec::new();
    let mut parsed_appeals: Vec<DailyStat> = Vec::new();
    for i in 0..raw_data.len() {
        let timestamp_u64 = raw_data[i].timestamp.to_string().parse::<i64>().unwrap() / 1000;
        let dt = Utc.timestamp_opt(timestamp_u64, 0).unwrap().to_string();
        let split_date: Vec<&str> = dt.split(" ").collect();
        let split_msg: Vec<&str> = raw_data[i].msg.split("_").collect();
        // Populate arrays
        if split_msg[0] == "RETRIEVE" {
            let count = retrievals.entry(split_date[0].to_string()).or_insert(0);
            *count += 1;
        }
        if split_msg[0] == "START" {
            let count = appeals.entry(split_date[0].to_string()).or_insert(0);
            *count += 1;
        }
    }
    // Iterate over days
    println!("--> Creating aggregates for retrievals..");
    for (key, value) in retrievals.into_iter() {
        parsed_retrievals.push(DailyStat { day: key, count: value });
    }
    println!("--> Creating aggregates for appeals..");
    for (key, value) in appeals.into_iter() {
        parsed_appeals.push(DailyStat { day: key, count: value });
    }
    // Sort data by day
    parsed_retrievals.sort_by(|a, b| a.day.cmp(&b.day));
    parsed_appeals.sort_by(|a, b| a.day.cmp(&b.day));
    // Write static file into disk
    println!("--> Writing files into disk..");
    std::fs::write(
        out_path.clone() + &"calls/retrievals.json".to_owned(),
        serde_json::to_string_pretty(&parsed_retrievals).unwrap()
    )?;
    std::fs::write(
        out_path.clone() + &"calls/appeals.json".to_owned(),
        serde_json::to_string_pretty(&parsed_appeals).unwrap()
    )?;
    println!("--> Task completed");
    Ok(())
}