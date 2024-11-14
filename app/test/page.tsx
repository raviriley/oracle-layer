"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Rocket, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StepLoader from "@/components/ui/mutli-step-loader";

const loadingSteps = [
  { text: "Validating input..." },
  { text: "Testing request..." },
  { text: "Configuring response..." },
  { text: "Creating oracle..." },
  { text: "Compiling into wasm..." },
  { text: "Deploying oracle..." },
  { text: "Collecting telemetry..." },
];

interface TestResponse {
  success?: boolean;
  value?: any;
  error?: string;
}

export default function LaunchOracle() {
  const [currentStep, setCurrentStep] = useState(0);
  const [parsedResponse, setParsedResponse] = useState<string>("loading...");
  const [isJsonValid, setIsJsonValid] = useState(true);
  const [selectedValue, setSelectedValue] = useState("");
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testResponse, setTestResponse] = useState<TestResponse | null>(null);

  const [deployLoading, setDeployLoading] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const firstStep = async () => {
    const toastId = toast.loading("Sending request...");
    const options: RequestInit = {
      method: form.getValues("method"),
      headers: form.getValues("headers").reduce(
        (acc, header) => {
          if (header.key && header.value) {
            acc[header.key] = header.value;
          }
          return acc;
        },
        {} as Record<string, string>,
      ),
    };
    if (
      ["POST", "PUT", "PATCH"].includes(form.getValues("method")) &&
      form.getValues("body")
    ) {
      options.body = form.getValues("body");
    }
    // make the request
    try {
      const res = await fetch(form.getValues("url"), options);
      const responseText = await res.text();
      let responseJSON;

      try {
        responseJSON = JSON.parse(responseText);
        setIsJsonValid(true);
        setParsedResponse(responseJSON);
      } catch (error) {
        setIsJsonValid(false);
        setParsedResponse(responseText);
        toast.error("Response is not valid JSON", {
          id: toastId,
        });
        console.error(error);
      }
      toast.success("Request successful", {
        id: toastId,
      });
    } catch (error) {
      toast.error("Error sending request", {
        id: toastId,
      });
      console.error(error);
    }
  };

  const formSchema = z.object({
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
    url: z.string().trim().url({
      message: "Please enter a valid URL",
    }),
    body: z.string().optional(),
    headers: z.array(z.object({ key: z.string(), value: z.string() })),
    selectedPath: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      method: "GET",
      url: "",
      body: "",
      headers: [{ key: "", value: "" }],
      selectedPath: "",
    },
  });

  const addHeader = () => {
    const headers = form.getValues("headers");
    form.setValue("headers", [...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    const headers = form.getValues("headers");
    form.setValue(
      "headers",
      headers.filter((_, i) => i !== index),
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.trigger();
    if (form.formState.isValid) {
      console.log("submit");
    }
  };

  const handleDeploy = async () => {
    setDeployLoading(true);
    console.log(form.getValues());
  };

  const renderClickableJson = (data: any, path: (string | number)[] = []) => {
    if (typeof data !== "object" || data === null) {
      const dataString = JSON.stringify(data);
      return (
        <span
          className={`cursor-pointer hover:bg-purple-100 px-1 rounded ${
            dataString === JSON.stringify(selectedValue) ? "bg-purple-200" : ""
          }`}
          onClick={() => {
            setSelectedValue(data);
            form.setValue("selectedPath", path.join("."));
            setTestResponse(null);
          }}
        >
          {dataString}
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

  const handleTestRequest = async () => {
    const selectedPath = form.getValues("selectedPath");
    if (!selectedPath || !form.getValues("url")) return;

    setIsTestLoading(true);
    setTestResponse(null);

    const options: RequestInit = {
      method: form.getValues("method"),
      headers: form.getValues("headers").reduce(
        (acc, header) => {
          if (header.key && header.value) {
            acc[header.key] = header.value;
          }
          return acc;
        },
        {} as Record<string, string>,
      ),
    };

    if (
      ["POST", "PUT", "PATCH"].includes(form.getValues("method")) &&
      form.getValues("body")
    ) {
      options.body = form.getValues("body");
    }

    try {
      const res = await fetch(form.getValues("url"), options);
      const data = await res.json();
      const extractedValue = selectedPath.split(".").reduce((acc, part) => {
        if (acc === null || acc === undefined) return null;
        return acc[part];
      }, data);

      setTestResponse({
        success: true,
        value: extractedValue,
      });
      toast.success("Test request successful");
    } catch (error) {
      setTestResponse({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      toast.error("Error testing request");
    } finally {
      setIsTestLoading(false);
    }
  };

  if (deployLoading) {
    return (
      <StepLoader
        steps={loadingSteps}
        loading={deployLoading}
        step={0}
        error={""}
        setLoading={setDeployLoading}
      />
    );
  }

  return (
    <Card className="mx-auto w-auto md:m-8 h-full">
      <CardHeader>
        <CardTitle>Oracle Builder</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="relative space-y-3 overflow-hidden"
          >
            <motion.div
              className={cn("space-y-3 absolute w-full", {
                relative: currentStep === 0,
              })}
              animate={{
                translateX: `-${currentStep * 100}%`,
              }}
              transition={{
                ease: "easeInOut",
              }}
            >
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Method</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.trigger();
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["GET", "POST", "PUT", "PATCH", "DELETE"].map(
                            (m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://api.example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {["POST", "PUT", "PATCH"].includes(form.getValues("method")) && (
                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Body</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Request body (JSON)"
                          {...field}
                          rows={5}
                          disabled={
                            !["POST", "PUT", "PATCH"].includes(
                              form.getValues("method"),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="space-y-2 flex flex-col">
                <FormLabel className="mr-2">Headers</FormLabel>
                {form.watch("headers").map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`headers.${index}.key`}
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input placeholder="Header name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`headers.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                          <FormControl>
                            <Input placeholder="Header value" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
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
            </motion.div>
            <motion.div
              className={cn("space-y-3 absolute w-full", {
                relative: currentStep === 1,
              })}
              animate={{
                translateX: `${1 * 100 - currentStep * 100}%`,
              }}
              style={{
                translateX: `${1 * 100 - currentStep * 100}%`,
              }}
              transition={{
                ease: "easeInOut",
              }}
            >
              <div className="">
                {!isJsonValid ? (
                  <div>
                    <h2 className="text-xl font-bold text-red-500 mb-2">
                      Response is not valid JSON:
                    </h2>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                      {parsedResponse}
                    </pre>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold">Response</h2>
                    <p className="text-sm text-gray-600 mb-2">
                      Click on any value in the response to select it
                    </p>
                    <div className="space-y-4">
                      <ScrollArea className="sm:h-[200px] md:h-[300px] rounded-md bg-gray-100 p-4 font-mono">
                        {renderClickableJson(parsedResponse)}
                      </ScrollArea>

                      {form.watch("selectedPath") && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Selected path
                          </h3>
                          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                            {form.watch("selectedPath")}
                          </pre>
                          <Button
                            type="button"
                            onClick={handleTestRequest}
                            disabled={
                              !form.getValues("selectedPath") || isTestLoading
                            }
                            variant="secondary"
                            className="mt-2"
                          >
                            {isTestLoading ? "Testing..." : "Test Request"}
                          </Button>
                          {testResponse && (
                            <div>
                              <h3 className="text-lg font-semibold my-2">
                                Test Result
                              </h3>
                              {testResponse.success ? (
                                <div className="bg-gray-100 p-4 rounded-md">
                                  <p className="text-sm text-gray-600 mb-2">
                                    Value extracted from path:{" "}
                                    {form.watch("selectedPath")}
                                  </p>
                                  <pre className="overflow-x-auto">
                                    {JSON.stringify(
                                      testResponse.value,
                                      null,
                                      2,
                                    )}
                                  </pre>
                                </div>
                              ) : (
                                <div className="bg-red-50 text-red-600 p-4 rounded-md">
                                  <p className="font-semibold">
                                    Error testing path:
                                  </p>
                                  <p>{testResponse.error}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
            <motion.div
              className={cn("space-y-3 absolute w-full", {
                relative: currentStep === 2,
              })}
              animate={{
                translateX: `${2 * 100 - currentStep * 100}%`,
              }}
              style={{
                translateX: `${2 * 100 - currentStep * 100}%`,
              }}
              transition={{
                ease: "easeInOut",
              }}
            >
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">Summary</h2>

                  {/* Basic Request Details */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Setting</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Method</TableCell>
                        <TableCell>{form.getValues("method")}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">URL</TableCell>
                        <TableCell className="break-all">
                          {form.getValues("url")}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Selected Path
                        </TableCell>
                        <TableCell className="font-mono">
                          {form.getValues("selectedPath")}
                        </TableCell>
                      </TableRow>
                      {/* Test Response (if available) */}
                      {testResponse && testResponse.success && (
                        <TableRow>
                          <TableCell className="font-medium">
                            Sample Response Value
                          </TableCell>
                          <TableCell>
                            <pre className="text-sm bg-gray-50 p-2 rounded border overflow-x-auto">
                              {JSON.stringify(testResponse.value, null, 2)}
                            </pre>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Request Body (if present) */}
                  {form.getValues("body") && (
                    <div className="mt-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Request Body</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <pre className="text-sm bg-gray-50 p-2 rounded border overflow-x-auto">
                                {form.getValues("body")}
                              </pre>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Headers (if any) */}
                  {form.getValues("headers").some((h) => h.key && h.value) && (
                    <div className="mt-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Header Name</TableHead>
                            <TableHead>Header Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {form
                            .getValues("headers")
                            .filter((h) => h.key && h.value)
                            .map((header, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {header.key}
                                </TableCell>
                                <TableCell>{header.value}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-purple-800 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Ready to Deploy
                  </h3>
                  <p className="mt-2 text-sm text-purple-700">
                    Your oracle configuration is ready to be deployed.
                  </p>
                </div>
              </div>
            </motion.div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-between">
        {/* Navigation buttons */}
        <Button
          type="button"
          variant={"outline"}
          onClick={() => {
            prevStep();
          }}
          className={cn({
            // hide if on first step
            hidden: currentStep == 0,
          })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="button"
          className={cn(
            {
              // hide if on last step
              hidden: currentStep == 2,
            },
            "ml-auto dark:text-gray-300",
          )}
          onClick={async () => {
            // validation
            const firstStepFields = [
              "method",
              "url",
              "body",
              "headers",
            ] as const;
            let isValid = true;

            await form.trigger(firstStepFields);

            firstStepFields.forEach((field) => {
              const fieldState = form.getFieldState(field);
              if (fieldState.invalid) {
                isValid = false;
              }
            });

            if (isValid) {
              if (currentStep === 0) {
                firstStep();
              }
              console.log("next:", currentStep);
              nextStep();
              console.log("next:", currentStep);
            }
          }}
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        {currentStep === 2 && (
          <Button
            type="submit"
            className="flex items-center justify-center dark:text-gray-300"
            onClick={handleDeploy}
          >
            deploy
            <Rocket className="w-4 h-4 ml-2 mt-1 animate-bounce" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
