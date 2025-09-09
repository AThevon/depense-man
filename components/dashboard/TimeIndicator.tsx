import { Calendar, Clock } from 'lucide-react';

interface TimeIndicatorProps {
  className?: string;
}

const TimeIndicator = ({ className = '' }: TimeIndicatorProps) => {
  const today = new Date();
  const dayOfMonth = today.getDate();
  
  return (
    <div className={`flex items-center justify-center py-4 ${className}`}>
      <div className="flex items-center space-x-3 w-full max-w-md">
        <div className="flex-1 h-px bg-border"></div>
        <div className="flex items-center space-x-2 px-3 py-2 bg-primary/10 rounded-full border border-primary/20">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Aujourd&apos;hui - Le {dayOfMonth}
          </span>
          <Calendar className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 h-px bg-border"></div>
      </div>
    </div>
  );
};

export default TimeIndicator; 