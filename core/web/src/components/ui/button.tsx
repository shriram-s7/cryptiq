import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Locally owned shadcn-style primitive, using the shared CryptIQ palette.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-btn text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
  { variants: {
    variant: {
      default: 'bg-emerald-600 text-white hover:bg-emerald-700',
      outline: 'border border-slate-200 bg-white text-ink-900 hover:bg-slate-50',
    },
    size: { default: 'h-11 px-5', sm: 'h-9 px-3' },
  }, defaultVariants: { variant: 'default', size: 'default' } },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : 'button';
    return <Component ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = 'Button';
