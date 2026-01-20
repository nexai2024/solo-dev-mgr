import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "glass-light rounded-lg px-4 py-3 w-full text-foreground placeholder:text-muted-foreground transition-all duration-200 outline-none resize-none min-h-16",
        "focus:glass focus:ring-2 focus:ring-hot-pink-500/50 focus:border-hot-pink-500/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
