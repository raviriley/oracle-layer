"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function LaunchToken() {
  const [currentStep, setCurrentStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const formSchema = z.object({
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
    url: z.string().trim().url({
      message: "Please enter a valid URL",
    }),
    body: z.string().optional(),
    headers: z.array(z.object({ key: z.string(), value: z.string() })),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      method: "GET",
      url: "",
      body: "",
      headers: [{ key: "", value: "" }],
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

  return (
    <div className="max-w-2xl mx-auto">
      <>
        <Card className="w-auto m-8">
          <CardHeader>
            <CardTitle>Oracle Builder</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Form {...form}>
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="relative space-y-3 overflow-x-hidden"
              >
                <motion.div
                  className={cn("space-y-3")}
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

                  {["POST", "PUT", "PATCH"].includes(
                    form.getValues("method"),
                  ) && (
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
                  className={"space-y-3 absolute -top-3 left-0 right-0"}
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
                  <div>todo</div>
                </motion.div>
                {/* Navigation buttons */}
                <div className="flex items-center justify-between">
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
                        hidden: currentStep == 1,
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
                        nextStep();
                      }
                    }}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  {currentStep === 1 && (
                    <Button
                      type="submit"
                      className="flex items-center justify-center dark:text-gray-300"
                    >
                      deploy
                      <Rocket className="w-4 h-4 ml-2 mt-1 animate-bounce" />
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </>
    </div>
  );
}
