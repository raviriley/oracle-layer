"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export default function QueryAVS() {
  const [name, setName] = useState("");
  const [data, setData] = useState({
    results: [
      {
        operator_url: "https://op1.hack.layer.xyz",
        output: { output: { y: 225 } },
      },
      {
        operator_url: "https://op2.hack.layer.xyz",
        output: { output: { y: 225 } },
      },
      {
        operator_url: "https://op3.hack.layer.xyz",
        output: { output: { y: 225 } },
      },
    ],
  });
  // const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const queryAPI = () => {
    setLoading(true);
    // Replace '/api/avs' with your actual AVS endpoint
    fetch("/api/avs")
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching AVS data:", error);
        toast.error("Error fetching AVS data");
        setLoading(false);
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === "") {
      toast.error("Please enter an oracle name to query");
      return;
    }
    queryAPI();
  };

  if (!data && !loading) {
    return (
      <Card className="w-auto max-w-3xl mx-2 md:mx-auto my-2 md:my-8 h-full">
        <CardHeader>
          <CardTitle>Oracle Name</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Enter an oracle name to query"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit">Submit</Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="w-auto max-w-3xl mx-2 md:mx-auto my-2 md:my-8 h-full">
        <CardHeader>
          <CardTitle>Loading AVS Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="w-auto max-w-3xl mx-2 md:mx-auto my-2 md:my-8 h-full">
        <CardHeader>
          <CardTitle>Error Loading Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Error loading AVS data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-auto max-w-3xl mx-2 md:mx-auto my-2 md:my-8 h-full">
      <CardHeader>
        <CardTitle>AVS Operators and Responses</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operator URL</TableHead>
              <TableHead>Output</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.results.map((result, index) => (
              <TableRow key={index}>
                <TableCell>{result.operator_url}</TableCell>
                <TableCell>
                  <pre className="text-sm">
                    {JSON.stringify(result.output, null, 2)}
                  </pre>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
