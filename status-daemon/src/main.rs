use std::time::{ SystemTime };
use std::env;
mod pings;
mod calls;
mod deals;

#[tokio::main]
async fn main() {
    let now = SystemTime::now();
    // Fetch all arguments
    let args: Vec<String> = env::args().collect();
    let mut pings = false;
    let mut calls = false;
    let mut deals = false;
    let mut out_path = "./stats/";
    for i in 0..args.len() {
        if args[i] == "--pings" || args[i] == "--all" {
            pings = true;
        }
        if args[i] == "--calls" || args[i] == "--all" {
            calls = true;
        }
        if args[i] == "--deals" || args[i] == "--all" {
            deals = true;
        }
        if args[i] == "--out" {
            out_path = &args[i+1];
        }
    }
    // Run ping calculation
    if pings == true {
        let _result_pings = pings::calculate(out_path.to_string()).await;
        // Activate to debug errors
        // dbg!(_result_pings);
    }
    // Run calls calculation
    if calls == true {
        let _result_calls = calls::calculate(out_path.to_string()).await;
        // Activate to debug errors
        // dbg!(_result_calls);
    }
    // Run deals calculation
    if deals == true {
        let _result_deals = deals::calculate(out_path.to_string()).await;
        // Activate to debug errors
        // dbg!(_result_deals);
    }
    // Print elapsed time
    match now.elapsed() {
        Ok(elapsed) => {
            println!("All tasks completed in {} ms", elapsed.as_millis());
        }
        Err(e) => {
            println!("Error: {e:?}");
        }
    }
}