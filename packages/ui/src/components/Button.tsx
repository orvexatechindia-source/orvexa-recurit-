import * as React from "react";
import { cn } from "../utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-98",
          // Variants
          variant === 'primary' && "bg-[#2563EB] text-white hover:bg-[#1d4ed8] focus-visible:ring-[#2563EB]",
          variant === 'secondary' && "bg-[#0B1220] text-white hover:bg-[#1a2333] focus-visible:ring-[#0B1220]",
          variant === 'accent' && "bg-[#06B6D4] text-white hover:bg-[#0891b2] focus-visible:ring-[#06B6D4]",
          variant === 'outline' && "border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900",
          variant === 'ghost' && "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900",
          // Sizes
          size === 'sm' && "h-9 px-3 text-sm",
          size === 'md' && "h-10 px-4 text-base",
          size === 'lg' && "h-11 px-6 text-lg",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
