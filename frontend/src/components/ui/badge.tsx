import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
        secondary: "border-transparent bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20",
        destructive: "border-transparent bg-[hsl(var(--error-light))] text-[hsl(var(--error))] border-[hsl(var(--error))]/30 hover:bg-[hsl(var(--error))]/20",
        outline: "text-foreground border-border hover:bg-muted/50",
        success: "border-transparent bg-[hsl(var(--success-light))] text-[hsl(var(--success))] border-[hsl(var(--success))]/30 hover:bg-[hsl(var(--success))]/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
