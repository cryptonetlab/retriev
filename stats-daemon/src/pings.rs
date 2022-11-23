use futures::stream::TryStreamExt;
use std::collections::HashMap;
use mongodb::{ options::ClientOptions, options::FindOptions, Client };
use mongodb::bson::{ doc };
use serde::{ Deserialize, Serialize };
use dotenv::dotenv;
use chrono::prelude::*;
use chrono::{ Utc };

pub async fn calculate_pings() -> mongodb::error::Result<()> {
    dotenv().ok();
    // Define env variables
    let mongodb_connection = std::env
        ::var("MONGODB_CONNECTION")
        .expect("failed to find mongodb connection");
    let database_name = std::env::var("MONGODB_DB").expect("failed to find mongodb database");
    // Define structs
    #[derive(Debug, Serialize, Deserialize)]
    struct Referee {
        address: String,
        active: bool,
    }
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
        uptime: f64,
    }
    // Parse your connection string into an options struct
    let mut client_options = ClientOptions::parse(mongodb_connection).await?;
    // Manually set an option
    client_options.app_name = Some("Retriev Stats Daemon".to_string());
    // Get a handle to the cluster
    let client = Client::with_options(client_options)?;
    // Connect to database and take the collection
    client.database("admin").run_command(doc! { "ping": 1 }, None).await?;
    println!("Connected successfully.");
    let db = client.database(&database_name);
    let referees = db.collection::<Referee>("referees");
    let activities = db.collection::<Stat>("activities");
    // Search all referees
    let mut _referee_cursor = referees.find(
        doc! { "active": true },
        FindOptions::builder()
            .sort(doc! { "timestamp": -1 })
            .limit(43200)
            .build()
    ).await?;
    let referees: Vec<_> = _referee_cursor.try_collect().await?;
    // Iterate over all referees
    for i in 0..referees.len() {
        // Find elements in database
        let mut _activities_cursor = activities.find(
            doc! { "referee": &referees[i].address, "msg": "PING" },
            FindOptions::builder()
                .sort(doc! { "timestamp": -1 })
                // Change this parameter to analyze more than 30 days
                .limit(60 * 24 * 30)
                .build()
        ).await?;
        // Build raw datas
        let raw_data: Vec<_> = _activities_cursor.try_collect().await?;
        println!("Found {} pings for {}.", raw_data.len(), referees[i].address);
        // Instantiate working variables
        let mut parsed_data: Vec<DailyStat> = Vec::new();
        let mut uptimes = HashMap::new();
        // Iterate over ping signals creating aggregates by day.
        for i in 0..raw_data.len() {
            // Pick a day
            let timestamp_u64 = raw_data[i].timestamp.to_string().parse::<i64>().unwrap() / 1000;
            let dt = Utc.timestamp_opt(timestamp_u64, 0).unwrap().to_string();
            let split: Vec<&str> = dt.split(" ").collect();
            let count = uptimes.entry(split[0].to_string()).or_insert(0);
            *count += 1;
        }
        // Iterate over days and calculate the uptime
        for (key, value) in uptimes.into_iter() {
            let uptime: f64 = (f64::from(value) / 1440.0) * 100.0;
            parsed_data.push(DailyStat { day: key, uptime: uptime });
        }
        // Sort data by day
        parsed_data.sort_by(|a, b| a.day.cmp(&b.day));
        // Write static file into disk
        std::fs::write(
            "./stats/pings/".to_owned() + &referees[i].address + &".json".to_owned(),
            serde_json::to_string_pretty(&parsed_data).unwrap()
        )?;
    }

    Ok(())
}