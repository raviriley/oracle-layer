#[allow(warnings)]
mod bindings;
use bindings::{Guest, Output, TaskQueueInput};

mod coin_gecko;
mod price_history;

use layer_wasi::{block_on, Reactor, Request, WasiPollable};

use serde::Serialize;

struct Component;

impl Guest for Component {
    fn run_task(_input: TaskQueueInput) -> Output {
        block_on(get_avg_btc)
    }
}

/// Record the latest BTCUSD price and return the JSON serialized result to write to the chain.
async fn get_avg_btc(reactor: Reactor) -> Result<Vec<u8>, String> {
    // Create request
    let mut req = Request::get("https://jsonplaceholder.typicode.com/users")?;

    // Add headers
    let headers_json = r#"{"Accept": "application/json"}"#;

    let headers_map: serde_json::Value = serde_json::from_str(headers_json)
        .map_err(|e| format!("Invalid headers JSON '{}': {}", headers_json, e))?;

    if let Some(obj) = headers_map.as_object() {
        for (key, value) in obj {
            req.headers
                .push((key.clone(), value.as_str().unwrap_or_default().to_string()));
        }
    }

    // Send request and get response
    let res = reactor.send(req).await?;

    // Check status and parse JSON
    match res.status {
        200 => {
            let json: serde_json::Value = res.json()?;

            // Extract value using JSON path
            let value = jsonpath_lib::select(&json, "$[0].id")
                .map_err(|e| format!("Invalid JSON path: {}", e))?
                .first()
                .ok_or_else(|| "No value found at JSON path".to_string())?
                .to_string();

            CalculatedPrices { price: value }.to_json()
        }
        status => Err(format!("unexpected status code: {status}")),
    }
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
