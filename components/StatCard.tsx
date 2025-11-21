import React from 'react';

interface Props {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  color?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<Props> = ({ title, value, subtitle, color, icon, className }) => {
  return (
    <div className={`bg-tokyo-card rounded-xl p-6 border border-white/5 shadow-lg relative overflow-hidden ${className}`}>
        <div className="flex justify-between items-start z-10 relative">
            <div>
                <h4 className="text-tokyo-fg/70 text-sm font-medium uppercase tracking-wider">{title}</h4>
                <div className="mt-2 text-3xl font-bold text-white flex items-baseline gap-2" style={{ color: color }}>
                    {value}
                </div>
                {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
            </div>
            {icon && <div className="text-white/20">{icon}</div>}
        </div>
        {/* Decorative glow */}
        {color && (
            <div 
                className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: color }}
            />
        )}
    </div>
  );
};
