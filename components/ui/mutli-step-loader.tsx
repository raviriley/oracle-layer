"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Circle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type LoadingStep = {
  text: string;
};

interface StepLoaderProps {
  steps: LoadingStep[];
  loading: boolean;
  step: number;
  error: string;
  setLoading: (loading: boolean) => void;
}

export default function StepLoader({
  steps,
  loading,
  step,
  error,
  setLoading,
}: StepLoaderProps) {
  const router = useRouter();

  useEffect(() => {
    if (error && loading) {
      const timer = setTimeout(() => {
        setLoading(false);
        router.refresh();
      }, 2000);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, loading, router]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/30 backdrop-blur-sm"
        >
          <div className="w-full max-w-md space-y-4 relative pt-[15%] pl-6">
            {steps.map((stepItem, index) => {
              const distance = Math.abs(index - step);
              const opacity = Math.max(1 - distance * 0.2, 0);

              return (
                <motion.div
                  key={index}
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity, y: -(step * 40) }}
                  transition={{ duration: 0.5 }}
                >
                  {index < step ? (
                    <CheckCircle className="h-8 w-8 text-primary" />
                  ) : index === step && error ? (
                    <XCircle className="h-8 w-8 text-destructive" />
                  ) : (
                    <Circle className="h-8 w-8 text-muted-foreground" />
                  )}
                  <span
                    className={cn(
                      "text-md font-medium",
                      index === step
                        ? error
                          ? "text-destructive"
                          : "text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {stepItem.text}
                    {error && index === step && (
                      <>
                        <br />
                        {error}
                      </>
                    )}
                  </span>
                </motion.div>
              );
            })}
          </div>
          <div className="bg-gradient-to-t inset-x-0 z-20 bottom-0 bg-background h-full absolute [mask-image:radial-gradient(900px_at_center,transparent_50%,white)]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
