from flask import Flask, jsonify, request
import json
import subprocess
import os
import re

app = Flask(__name__)


@app.route("/create_oracle", methods=["POST"])
def create_oracle_route():
    # Parse request body as JSON
    data = request.get_json()

    # Construct environment variables string
    envs = {
        "HTTP_METHOD": data["method"],
        "REQUEST_URL": data["url"],
        "JSON_PATH": data["selectedPath"],
    }

    # Add optional body if present
    if data.get("body"):
        envs["REQUEST_BODY"] = data["body"]

    # Add headers if present
    headers_json = None
    if data.get("headers"):
        headers_json = json.dumps({h["key"]: h["value"] for h in data["headers"]})
        envs["REQUEST_HEADERS"] = headers_json

    # Update wasi_comp with actual values
    updated_wasi = wasi_comp.format(
        method=data["method"],
        url=data["url"],
        json_path=data["selectedPath"],
        body=data.get("body", ""),
        headers_json=headers_json or "",
    )

    # Write updated WASI component to file
    with open("../wasi/oracle-example/src/lib.rs", "w") as f:
        f.write(updated_wasi)

    # Add environment variables to current environment
    for key, value in envs.items():
        os.environ[key] = value

    # Convert envs dict to CLI-friendly string
    envs_str = ",".join([f"{k}={v}" for k, v in envs.items()])

    os.system(f"avs-toolkit-cli wasmatic deploy --name {request.args.get('name')} \
    --wasm-source ./target/wasm32-wasip1/release/my_task.wasm  \
    --testable \
    --envs {envs_str} \
    --task $TEST_TASK_QUEUE_ADDRESS")
    return {"message": "success"}


def parse_output_to_json(output):
    output_str = output.decode("utf-8") if isinstance(output, bytes) else output
    pattern = r"Output for operator `(https://[^`]+)`: ({.*?})"
    matches = re.findall(pattern, output_str)
    results = [
        {"operator_url": url, "output": json.loads(output_json)}
        for url, output_json in matches
    ]
    return {"results": results}


@app.route("/query_oracle", methods=["GET"])
def query_oracle_route():
    cmd = f"avs-toolkit-cli wasmatic test --name {request.args.get('name')}"
    output = subprocess.check_output(cmd, shell=True)
    parsed_data = parse_output_to_json(output)
    return jsonify(parsed_data)


wasi_comp = """
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
    // //Get environment variables for request configuration
    // let method =
    //     std::env::var("HTTP_METHOD").or(Err("missing env var `HTTP_METHOD`".to_string()))?;
    // let url = std::env::var("REQUEST_URL").or(Err("missing env var `REQUEST_URL`".to_string()))?;
    // let json_path =
    //     std::env::var("JSON_PATH").or(Err("missing env var `JSON_PATH`".to_string()))?;

    // // Optional body and headers
    // let body = std::env::var("REQUEST_BODY").ok();
    // let headers_json = std::env::var("REQUEST_HEADERS").ok();
    let method = "{method}";
    let url = "{url}";
    let json_path = "{json_path}";
    let body = Some("{body}".to_string());
    let headers_json = Some("{headers_json}".to_string());

    // Create HTTP client
    let client = reqwest::Client::new();

    // Build request
    let mut request = client.request(
        method
            .parse()
            .map_err(|e| format!("Invalid HTTP method: {}", e))?,
        url,
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
"""
