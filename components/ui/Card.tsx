import { forwardRef, HTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  divided?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  children,
  ...props
}, ref) => {
  const baseClasses = 'rounded-xl transition-all duration-200';
  
  const variants = {
    default: 'bg-surface border border-default',
    elevated: 'bg-surface-elevated border border-light shadow-lg',
    outlined: 'bg-background border-2 border-primary border-opacity-20',
  };

  const paddings = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const hoverClasses = hover ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' : '';

  const classes = [
    baseClasses,
    variants[variant],
    paddings[padding],
    hoverClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(({
  icon: Icon,
  title,
  subtitle,
  action,
  className = '',
  children,
  ...props
}, ref) => {
  const classes = `flex items-center justify-between ${className}`;

  return (
    <div ref={ref} className={classes} {...props}>
      <div className="flex items-center space-x-3">
                {Icon && (
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-text">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-secondary">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
      {action && (
        <div className="flex items-center space-x-2">
          {action}
        </div>
      )}
    </div>
  );
});

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({
  className = '',
  children,
  ...props
}, ref) => {
  const classes = `${className}`;

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(({
  divided = false,
  className = '',
  children,
  ...props
}, ref) => {
  const classes = [
    'mt-4 flex items-center justify-between',
    divided ? 'pt-4 border-t border-default' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

export default Card;
export { CardHeader, CardContent, CardFooter }; 