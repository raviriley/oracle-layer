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
        "HTTP_METHOD": '"'+data["method"]+'"',
        "REQUEST_URL": '"'+data["url"]+'"',
        "JSON_PATH": '"'+data["selectedPath"]+'"',
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
    print(envs_str)
    

    req = f"avs-toolkit-cli wasmatic deploy --name {request.args.get('name')} \
    --wasm-source ../target/wasm32-wasip1/release/oracle_example.wasm  \
    --testable \
    --envs {envs_str} \
    --task $TEST_TASK_QUEUE_ADDRESS"
    print(req)
    os.system(req)
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
    return parsed_data
