#[allow(warnings)]
mod bindings;
use bindings::{Guest, Output, TaskQueueInput};

mod coin_gecko;
mod price_history;

use layer_wasi::{block_on, Reactor};

use serde::Serialize;
use std::time::{SystemTime, UNIX_EPOCH};

struct Component;

impl Guest for Component {
    fn run_task(_input: TaskQueueInput) -> Output {
        block_on(get_avg_btc)
    }
}

/// Record the latest BTCUSD price and return the JSON serialized result to write to the chain.
async fn get_avg_btc(reactor: Reactor) -> Result<Vec<u8>, String> {
    // Get environment variables for request configuration
    let method =
        std::env::var("HTTP_METHOD").or(Err("missing env var `HTTP_METHOD`".to_string()))?;
    let url = std::env::var("REQUEST_URL").or(Err("missing env var `REQUEST_URL`".to_string()))?;
    let json_path =
        std::env::var("JSON_PATH").or(Err("missing env var `JSON_PATH`".to_string()))?;

    // Optional body and headers
    let body = std::env::var("REQUEST_BODY").ok();
    let headers_json = std::env::var("REQUEST_HEADERS").ok();

    // Create HTTP client
    let client = reqwest::Client::new();

    // Build request
    let mut request = client.request(
        method
            .parse()
            .map_err(|e| format!("Invalid HTTP method: {}", e))?,
        &url,
    );

    // Add headers if provided
    if let Some(headers) = headers_json {
        let headers_map: serde_json::Value =
            serde_json::from_str(&headers).map_err(|e| format!("Invalid headers JSON: {}", e))?;

        if let Some(obj) = headers_map.as_object() {
            for (key, value) in obj {
                request = request.header(key, value.as_str().unwrap_or_default());
            }
        }
    }

    // Add body if provided
    if let Some(body_str) = body {
        request = request.body(body_str);
    }

    // Send request and get response
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
        .ok_or_else(|| "No value found at JSON path".to_string())?
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
