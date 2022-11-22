mod pings;

#[tokio::main]
async fn main() {
    // Run ping calculation
    let _result = pings::calculate_pings().await;
}