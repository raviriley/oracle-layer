from flask import Flask, jsonify, request
import json
import subprocess
import os
import re

app = Flask(__name__)


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response


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
    updated_wasi = f"""
#[allow(warnings)]
mod bindings;
use bindings::{{Guest, Output, TaskQueueInput}};

mod coin_gecko;
mod price_history;

use layer_wasi::{{block_on, Reactor, Request, WasiPollable}};

use serde::Serialize;

struct Component;

impl Guest for Component {{
    fn run_task(_input: TaskQueueInput) -> Output {{
        block_on(get_avg_btc)
    }}
}}

/// Record the latest BTCUSD price and return the JSON serialized result to write to the chain.
async fn get_avg_btc(reactor: Reactor) -> Result<Vec<u8>, String> {{
    // Create request
    let mut req = Request::get("{data['url']}")?;

    // Add headers
    let headers_json = r#"{headers_json if headers_json else '{"Accept": "application/json"}'}"#;

    let headers_map: serde_json::Value = serde_json::from_str(headers_json)
        .map_err(|e| format!("Invalid headers JSON '{{}}': {{}}", headers_json, e))?;

    if let Some(obj) = headers_map.as_object() {{
        for (key, value) in obj {{
            req.headers
                .push((key.clone(), value.as_str().unwrap_or_default().to_string()));
        }}
    }}

    // Send request and get response
    let res = reactor.send(req).await?;

    // Check status and parse JSON
    match res.status {{
        200 => {{
            let json: serde_json::Value = res.json()?;

            // Extract value using JSON path
            let value = jsonpath_lib::select(&json, "$[0].id")
                .map_err(|e| format!("Invalid JSON path: {{}}", e))?
                .first()
                .ok_or_else(|| "No value found at JSON path".to_string())?
                .to_string();

            CalculatedPrices {{ price: value }}.to_json()
        }}
        status => Err(format!("unexpected status code: {{status}}")),
    }}
}}

/// The returned result.
#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
struct CalculatedPrices {{
    price: String,
}}

impl CalculatedPrices {{
    /// Serialize to JSON.
    fn to_json(&self) -> Result<Vec<u8>, String> {{
        serde_json::to_vec(&self).map_err(|err| err.to_string())
    }}
}}

bindings::export!(Component with_types_in bindings);
"""

    # Write updated WASI component to file
    with open("../wasi/oracle-example/src/lib.rs", "w") as f:
        f.write(updated_wasi)

    # Add environment variables to current environment
    for key, value in envs.items():
        os.environ[key] = value

    # Convert envs dict to CLI-friendly string
    envs_str = ",".join([f"{k}={v}" for k, v in envs.items()])
    
    os.system("(cd .. && ./scripts/build_wasi.sh)")
    
    os.system("ls ../target/wasm32-wasip1/release/")
    
    os.system(f"avs-toolkit-cli wasmatic deploy --name {request.args.get('name')} \
    --wasm-source ../target/wasm32-wasip1/release/oracle_example.wasm \
    --testable \
    --envs {envs_str} \
    --task layer1f2tn7zp423zx0ddx8qvapr3kkvs6ygu5zdrsllzjhkak3qtljflsjahk08")

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


@app.route("/query_oracle", methods=["GET", "OPTIONS"])
def query_oracle_route():
    if request.method == "OPTIONS":
        # Handle preflight request
        response = app.make_response('')
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response

    # Handle GET request
    cmd = f"avs-toolkit-cli wasmatic test --name {request.args.get('name')}"
    output = subprocess.check_output(cmd, shell=True)
    parsed_data = parse_output_to_json(output)
    return jsonify(parsed_data)
