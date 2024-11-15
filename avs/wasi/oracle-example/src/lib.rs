#[allow(warnings)]
mod bindings;
use bindings::{Guest, Output, TaskQueueInput};

mod coin_gecko;
mod price_history;

use layer_wasi::{block_on, Reactor};

use serde::Serialize;

struct Component;

impl Guest for Component {
    fn run_task(_input: TaskQueueInput) -> Output {
        block_on(get_avg_btc)
    }
}

/// Record the latest BTCUSD price and return the JSON serialized result to write to the chain.
async fn get_avg_btc(_reactor: Reactor) -> Result<Vec<u8>, String> {
    let method = "GET";
    let url = "https://jsonplaceholder.typicode.com/users";
    let json_path = "[0].id";

    // Create and send request using Request type
    let request = Request::new(url)
        .method(method)
        .map_err(|e| format!("Failed to create request: {}", e))?;

    let response = request
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;

    // Extract value using JSON path
    let value = jsonpath_lib::select(&json, &json_path)
        .map_err(|e| format!("Invalid JSON path: {}", e))?
        .first()
        .ok_or_else(|| "No valu found at JSON path".to_string())?
        .to_string();

    CalculatedPrices { price: value }.to_json()
}

/// The returned result.
#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
struct CalculatedPrices {
    price: String,
}

impl CalculatedPrices {
    /// Serialize to JSON.
    fn to_json(&self) -> Result<Vec<u8>, String> {
        serde_json::to_vec(&self).map_err(|err| err.to_string())
    }
}

bindings::export!(Component with_types_in bindings);
