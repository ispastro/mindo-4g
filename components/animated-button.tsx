"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode
}

export function AnimatedButton({ children, className, ...props }: AnimatedButtonProps) {
  return (
    <Button
      className={cn("group", className)}
      {...props}
    >
      <span className="relative inline-block overflow-hidden">
        <span className="inline-block transition-transform duration-300 group-hover:-translate-y-full group-hover:opacity-0">
          {children}
        </span>
        <span className="absolute left-0 top-0 inline-block translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {children}
        </span>
      </span>
    </Button>
  )
}
