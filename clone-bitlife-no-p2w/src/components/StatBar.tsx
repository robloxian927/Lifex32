interface StatBarProps {
  label: string;
  value: number;
  color: string;
  icon: string;
}

export function StatBar({ label, value, color, icon }: StatBarProps) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-sm w-6">{icon}</span>
      <span className="text-xs font-medium w-20 text-gray-300">{label}</span>
      <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      <span className="text-xs font-bold w-8 text-right text-gray-300">{Math.round(value)}%</span>
    </div>
  );
}
