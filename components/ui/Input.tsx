import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { LucideIcon, Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  showPasswordToggle?: boolean;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helper,
  icon: Icon,
  iconPosition = 'left',
  showPasswordToggle = false,
  fullWidth = true,
  variant = 'default',
  type = 'text',
  className = '',
  disabled,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  const baseClasses = 'w-full rounded-lg border transition-all duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    default: 'bg-surface border-default text-text placeholder-text-muted',
    filled: 'bg-surface-elevated border-transparent text-text placeholder-text-muted',
    outlined: 'bg-background border-2 border-primary/20 text-text placeholder-text-muted',
  };

  const errorClasses = error ? 'border-red-500' : '';
  const focusClasses = isFocused && !error ? 'border-primary' : '';

  const paddingClasses = Icon 
    ? iconPosition === 'left' 
      ? 'pl-11 pr-4 py-3' 
      : 'pl-4 pr-11 py-3'
    : 'px-4 py-3';

  const inputClasses = [
    baseClasses,
    variants[variant],
    paddingClasses,
    errorClasses,
    focusClasses,
    className,
  ].filter(Boolean).join(' ');

  const containerClasses = fullWidth ? 'w-full' : '';

  return (
    <div className={containerClasses}>
      {label && (
        <label className="block text-sm font-medium text-text mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0' : 'right-0'} pl-3 flex items-center pointer-events-none`}>
            <Icon className="h-5 w-5 text-secondary" />
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          disabled={disabled}
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-secondary hover:text-text" />
            ) : (
              <Eye className="h-5 w-5 text-secondary hover:text-text" />
            )}
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
      
      {helper && !error && (
        <p className="mt-1 text-sm text-secondary">
          {helper}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 