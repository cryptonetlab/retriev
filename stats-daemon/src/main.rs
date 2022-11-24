use std::env;
mod pings;
mod calls;

#[tokio::main]
async fn main() {
    let args: Vec<String> = env::args().collect();
    let mut pings = false;
    let mut calls = false;
    for i in 0..args.len() {
        if args[i] == "--pings" || args[i] == "--all" {
            pings = true;
        }
        if args[i] == "--calls" || args[i] == "--all" {
            calls = true;
        }
    }
    // Run ping calculation
    if pings == true {
        let _result_pings = pings::calculate().await;
    }
    // Run calls calculation
    if calls == true {
        let _result_calls = calls::calculate().await;
    }
}