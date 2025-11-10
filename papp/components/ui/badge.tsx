'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';

const badgeVariants = {
  default:
    'inline-flex items-center rounded-full border border-transparent bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  secondary:
    'inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  outline:
    'inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-foreground',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants;
  asChild?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        ref={ref}
        className={cn(badgeVariants[variant], className)}
        {...props}
      />
    );
  },
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
