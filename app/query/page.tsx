"use client";

import React, { useState, useEffect } from "react";
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
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!loading) return;

    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/query_oracle?name=${name}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(""),
          },
        );
        if (!response.ok) {
          throw new Error(`Failed to query oracle: ${response.statusText}`);
        }
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error("Error fetching AVS data:", error);
        setError(error as Error);
        toast.error("Error fetching AVS data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [loading, name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === "") {
      toast.error("Please enter an oracle name to query");
      return;
    }
    setLoading(true);
    setError(null);
  };

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

  if (error) {
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

  if (!data) {
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
              className="w-[400px]"
            />
            <Button type="submit">Submit</Button>
          </form>
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
            {data.result.split("\n").map((line: any, index: number) => {
              const match = line.match(
                /Output for operator `([^`]+)`: (\{.*\})/,
              );
              if (match) {
                const operatorUrl = match[1];
                const output = JSON.parse(match[2]);

                // Replace "price" with "value" in the output object
                if (output.output && output.output.price) {
                  output.output.value = output.output.price;
                  delete output.output.price;
                }

                return (
                  <TableRow key={index}>
                    <TableCell>{operatorUrl}</TableCell>
                    <TableCell>
                      <pre className="text-sm">
                        {JSON.stringify(output, null, 2)}
                      </pre>
                    </TableCell>
                  </TableRow>
                );
              }
              return null;
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
