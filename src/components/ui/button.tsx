import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "destructive";
type ButtonSize = "sm" | "default" | "icon";

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover",
  secondary:
    "border border-border bg-surface text-foreground shadow-xs hover:bg-surface-muted",
  ghost: "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-surface-muted",
  destructive:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-md px-2.5 text-xs",
  default: "h-9 gap-2 rounded-lg px-3.5 text-sm",
  icon: "size-9 rounded-lg",
};

export function buttonClassName({
  variant = "secondary",
  size = "default",
}: ButtonStyleOptions = {}): string {
  return cn(
    "inline-flex shrink-0 items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonClassName({ variant, size }), className)}
      {...props}
    />
  );
}
