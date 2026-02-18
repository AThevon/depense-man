const TimeIndicator = ({ day, className = '' }: { day?: number; className?: string }) => {
  const displayDay = day || new Date().getDate();
  return (
    <div className={`flex items-center gap-3 py-3 ${className}`}>
      <div className="flex-1 h-px bg-[#6366f1]/30" />
      <span className="text-xs font-medium text-[#6366f1] whitespace-nowrap">
        Aujourd&apos;hui &mdash; J{displayDay}
      </span>
      <div className="flex-1 h-px bg-[#6366f1]/30" />
    </div>
  );
};

export default TimeIndicator;
