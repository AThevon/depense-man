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

  const baseClasses = 'w-full rounded-xl border transition-all duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed text-base focus:ring-2 focus:ring-primary/20';
  
  const variants = {
    default: 'bg-surface border-default/50 text-text placeholder-text-muted hover:border-default',
    filled: 'bg-surface-elevated border-transparent text-text placeholder-text-muted',
    outlined: 'bg-background border border-primary/30 text-text placeholder-text-muted',
  };

  const errorClasses = error ? 'border-error focus:border-error focus:ring-error/20' : '';
  const focusClasses = isFocused && !error ? 'border-primary' : '';

  const paddingClasses = Icon 
    ? iconPosition === 'left' 
      ? showPasswordToggle ? 'pl-12 pr-12 py-4' : 'pl-12 pr-4 py-4'
      : showPasswordToggle ? 'pl-4 pr-12 py-4' : 'pl-4 pr-12 py-4'
    : showPasswordToggle ? 'px-4 pr-12 py-4' : 'px-4 py-4';

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
        <label className="block text-sm font-semibold text-text mb-3">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center pointer-events-none`}>
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
            className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-primary/5 rounded-lg transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-secondary hover:text-primary transition-colors" />
            ) : (
              <Eye className="h-5 w-5 text-secondary hover:text-primary transition-colors" />
            )}
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-error font-medium">
          {error}
        </p>
      )}
      
      {helper && !error && (
        <p className="mt-2 text-sm text-secondary">
          {helper}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 