import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sectionCardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-md",
        flat: "shadow-none border-0 bg-muted/50",
        outline: "border-2",
      },
      spacing: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      spacing: "md",
    },
  }
);

export interface SectionCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sectionCardVariants> {
  children: React.ReactNode;
  title?: string;
  description?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const SectionCard = React.forwardRef<HTMLDivElement, SectionCardProps>(
  ({ 
    className, 
    variant, 
    spacing, 
    title, 
    description, 
    header, 
    footer, 
    children, 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(sectionCardVariants({ variant, spacing, className }))}
        {...props}
      >
        {(title || description || header) && (
          <div className="space-y-2 border-b pb-4 mb-4">
            {header || (
              <>
                {title && (
                  <h3 className="text-lg font-semibold leading-none tracking-tight">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-sm text-muted-foreground">
                    {description}
                  </p>
                )}
              </>
            )}
          </div>
        )}
        
        <div className="space-y-4">
          {children}
        </div>
        
        {footer && (
          <div className="border-t pt-4 mt-4">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

SectionCard.displayName = "SectionCard";

// Section Card Header Component
interface SectionCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const SectionCardHeader = React.forwardRef<HTMLDivElement, SectionCardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-2", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SectionCardHeader.displayName = "SectionCardHeader";

// Section Card Title Component
interface SectionCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const SectionCardTitle = React.forwardRef<HTMLHeadingElement, SectionCardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

SectionCardTitle.displayName = "SectionCardTitle";

// Section Card Description Component
interface SectionCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const SectionCardDescription = React.forwardRef<HTMLParagraphElement, SectionCardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

SectionCardDescription.displayName = "SectionCardDescription";

// Section Card Content Component
interface SectionCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const SectionCardContent = React.forwardRef<HTMLDivElement, SectionCardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SectionCardContent.displayName = "SectionCardContent";

// Section Card Footer Component
interface SectionCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const SectionCardFooter = React.forwardRef<HTMLDivElement, SectionCardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between pt-4 border-t", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SectionCardFooter.displayName = "SectionCardFooter";

export { 
  SectionCard, 
  SectionCardHeader, 
  SectionCardTitle, 
  SectionCardDescription, 
  SectionCardContent, 
  SectionCardFooter, 
  sectionCardVariants 
};
