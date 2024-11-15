from flask import Flask, jsonify, request
import json
import subprocess
import os
import re

app = Flask(__name__)

@app.route("/create_oracle", methods=['POST'])
def create_oracle_route():
    os.system(f"avs-toolkit-cli wasmatic deploy --name {request.args.get('name')} \
    --wasm-source ./target/wasm32-wasip1/release/my_task.wasm  \
    --testable \
    --task $TEST_TASK_QUEUE_ADDRESS")
    return {"message": "success"}

def parse_output_to_json(output):
    output_str = output.decode("utf-8") if isinstance(output, bytes) else output
    pattern = r'Output for operator `(https://[^`]+)`: ({.*?})'
    matches = re.findall(pattern, output_str)
    results = [{"operator_url": url, "output": json.loads(output_json)} for url, output_json in matches]
    return {"results": results}

@app.route('/query_oracle', methods=['GET'])
def query_oracle_route():
    cmd = f"avs-toolkit-cli wasmatic test --name {request.args.get('name')}"
    output = subprocess.check_output(cmd, shell=True)
    parsed_data = parse_output_to_json(output)
    return jsonify(parsed_data)
