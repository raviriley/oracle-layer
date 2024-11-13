"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

export function RequestBuilderComponent() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [body, setBody] = useState("");
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [response, setResponse] = useState(null);
  const [parsedResponse, setParsedResponse] = useState(null);
  const [isJsonValid, setIsJsonValid] = useState(true);
  const [finalData, setFinalData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);

  const handleHeaderChange = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);
    setParsedResponse(null);
    setIsJsonValid(true);
    setFinalData(null);

    const options = {
      method,
      headers: headers.reduce((acc, header) => {
        if (header.key && header.value) {
          acc[header.key] = header.value;
        }
        return acc;
      }, {}),
    };

    if (["POST", "PUT", "PATCH"].includes(method) && body) {
      options.body = body;
    }

    try {
      const res = await fetch(url, options);
      const textData = await res.text();
      let jsonData;

      try {
        jsonData = JSON.parse(textData);
        setIsJsonValid(true);
        setParsedResponse(jsonData);
      } catch (e) {
        setIsJsonValid(false);
        setParsedResponse(textData);
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
      });
    } catch (error) {
      setResponse({
        error: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderClickableJson = (data, path = []) => {
    if (typeof data !== "object" || data === null) {
      return (
        <span
          className={`cursor-pointer hover:bg-blue-100 px-1 rounded ${
            JSON.stringify(data) === JSON.stringify(selectedValue)
              ? "bg-blue-200"
              : ""
          }`}
          onClick={() => {
            setSelectedValue(data);
            setSelectedPath(path.join("."));
          }}
        >
          {JSON.stringify(data)}
        </span>
      );
    }

    if (Array.isArray(data)) {
      return (
        <span>
          [
          <div className="ml-4">
            {data.map((item, index) => (
              <div key={index}>
                {renderClickableJson(item, [...path, index])}
                {index < data.length - 1 && ","}
              </div>
            ))}
          </div>
          ]
        </span>
      );
    }

    return (
      <span>
        {"{"}
        <div className="ml-4">
          {Object.entries(data).map(([key, value], index, arr) => (
            <div key={key}>
              <span className="text-gray-500">&quot;{key}&quot;</span>:{" "}
              {renderClickableJson(value, [...path, key])}
              {index < arr.length - 1 && ","}
            </div>
          ))}
        </div>
        {"}"}
      </span>
    );
  };

  const handleFinalSubmit = () => {
    if (selectedPath === null) return;
    console.log("Final path to submit:", selectedPath);
    setFinalData(selectedPath);
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Oracle Builder</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="url"
            placeholder="Enter URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="flex-grow"
          />
        </div>
        {["POST", "PUT", "PATCH"].includes(method) && (
          <Textarea
            placeholder="Request body (JSON)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
          />
        )}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Headers</h2>
          {headers.map((header, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Header name"
                value={header.key}
                onChange={(e) =>
                  handleHeaderChange(index, "key", e.target.value)
                }
              />
              <Input
                placeholder="Header value"
                value={header.value}
                onChange={(e) =>
                  handleHeaderChange(index, "value", e.target.value)
                }
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeHeader(index)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove header</span>
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addHeader}>
            Add Header
          </Button>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Request"}
        </Button>
      </form>
      {response && (
        <div className="mt-8">
          <h2 className="text-xl font-bold">Response</h2>
          <p className="text-sm text-gray-600 mb-2">
            Click on any value in the response to select it
          </p>
          {!isJsonValid ? (
            <div>
              <p className="text-red-500 mb-2">Response is not valid JSON:</p>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                {parsedResponse}
              </pre>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-md overflow-x-auto font-mono">
                {renderClickableJson(parsedResponse)}
              </div>

              <Button
                type="button"
                onClick={handleFinalSubmit}
                disabled={selectedPath === null}
              >
                Submit Selected Path
              </Button>

              {finalData && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Selected Path:</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    {finalData}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
