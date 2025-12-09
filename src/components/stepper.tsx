import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Step {
  title: string
  status: "completed" | "current" | "upcoming"
}

interface StepperProps {
  steps: Step[]
}

export function Stepper({ steps }: StepperProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 font-medium transition-all",
                step.status === "completed" && "border-success bg-success text-success-foreground",
                step.status === "current" && "border-primary bg-primary text-primary-foreground",
                step.status === "upcoming" && "border-border bg-secondary text-muted-foreground",
              )}
            >
              {step.status === "completed" ? <Check className="h-5 w-5" /> : index + 1}
            </div>
            <span
              className={cn(
                "text-xs font-medium",
                step.status === "completed" && "text-success",
                step.status === "current" && "text-primary",
                step.status === "upcoming" && "text-muted-foreground",
              )}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "mx-2 h-0.5 flex-1 transition-all",
                step.status === "completed" ? "bg-success" : "bg-border",
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
