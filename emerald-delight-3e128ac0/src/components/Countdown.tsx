import { useCountdown } from "@/hooks/useCountdown";

interface CountdownProps {
  targetDate: string | Date;
  className?: string;
}

const Countdown = ({ targetDate, className = "" }: CountdownProps) => {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

  if (isExpired) {
    return (
      <div className={`inline-flex items-center gap-2 text-red-500 font-medium ${className}`}>
        <span className="text-sm">Event has ended</span>
      </div>
    );
  }

  const timeUnits = [
    { value: days, label: "Days" },
    { value: hours, label: "Hours" },
    { value: minutes, label: "Mins" },
    { value: seconds, label: "Secs" },
  ];

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="flex items-center">
          <div className="bg-gold/10 rounded px-2 py-1 min-w-[40px] text-center">
            <span className="text-gold font-bold text-sm">
              {unit.value.toString().padStart(2, "0")}
            </span>
            <span className="text-gold/70 text-[10px] block">{unit.label}</span>
          </div>
          {index < timeUnits.length - 1 && (
            <span className="text-gold/50 mx-1">:</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Countdown;
