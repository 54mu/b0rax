import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { CloudRain, CloudSnow } from 'lucide-react';
import { BoraDataPoint } from '../types';
import { TOKYO_COLORS, THRESHOLDS } from '../constants';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Props {
  data: BoraDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as BoraDataPoint;
    return (
      <div className="bg-tokyo-card border border-tokyo-accent p-3 rounded shadow-lg text-sm">
        <p className="font-bold text-tokyo-fg mb-1">
            {format(new Date(data.timestamp), 'EEEE d HH:mm', { locale: it })}
        </p>
        <p className="text-tokyo-cyan">
          ΔP: <span className="font-mono font-bold text-lg">{data.diff.toFixed(1)} hPa</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {data.timeOfDay}
        </p>
        {data.isDarkBora && (
            <div className="flex items-center gap-2 mt-1 text-tokyo-red font-bold text-xs animate-pulse">
                <CloudRain className="w-3 h-3" /> Bora Scura ({data.precipitation}mm)
            </div>
        )}
        <div className="mt-2 text-xs border-t border-gray-700 pt-2">
            <div>Maribor: {data.mariborPressure} hPa</div>
            <div>Trieste: {data.triestePressure} hPa</div>
        </div>
      </div>
    );
  }
  return null;
};

export const PressureChart: React.FC<Props> = ({ data }) => {
  
  // Helper to calculate dark bora areas
  // We want to merge contiguous timestamps into areas to avoid rendering 100 individual ReferenceAreas
  const darkBoraAreas: { x1: number, x2: number }[] = [];
  let currentStart: number | null = null;

  for (let i = 0; i < data.length; i++) {
      const point = data[i];
      const nextPoint = data[i + 1];

      if (point.isDarkBora) {
          if (currentStart === null) currentStart = point.timestamp;
          // If next point is NOT dark bora or we are at the end, close the area
          if (!nextPoint || !nextPoint.isDarkBora) {
              darkBoraAreas.push({ x1: currentStart, x2: point.timestamp });
              currentStart = null;
          }
      }
  }

  return (
    <div className="w-full h-[400px] bg-tokyo-bg/50 rounded-xl p-4 border border-white/5">
      <div className="flex justify-between items-center mb-4 ml-2 mr-2">
        <h3 className="text-tokyo-fg font-semibold">Andamento ΔP (Previsione 5gg)</h3>
        <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 bg-tokyo-fg/20 border border-tokyo-fg/40 rounded-sm"></span>
            <span className="text-gray-400">Bora Scura (Pioggia/Neve)</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorDiff" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={TOKYO_COLORS.accent} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={TOKYO_COLORS.accent} stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          {/* Dark Bora Highlights */}
          {darkBoraAreas.map((area, i) => (
              <ReferenceArea 
                key={i} 
                x1={area.x1} 
                x2={area.x2} 
                fill="#414868" 
                fillOpacity={0.3}
              />
          ))}

          <CartesianGrid strokeDasharray="3 3" stroke="#2a2e42" vertical={false} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(unix) => format(new Date(unix), 'dd/MM HH', { locale: it })}
            stroke="#565f89"
            tick={{ fill: '#565f89', fontSize: 12 }}
            minTickGap={30}
          />
          <YAxis 
            stroke="#565f89" 
            tick={{ fill: '#565f89', fontSize: 12 }}
            label={{ value: 'Δ hPa', angle: -90, position: 'insideLeft', fill: '#565f89' }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <ReferenceLine y={THRESHOLDS.MODERATE} stroke={TOKYO_COLORS.green} strokeDasharray="3 3" label={{ position: 'right', value: 'Moderata', fill: TOKYO_COLORS.green, fontSize: 10 }} />
          <ReferenceLine y={THRESHOLDS.STRONG} stroke={TOKYO_COLORS.yellow} strokeDasharray="3 3" label={{ position: 'right', value: 'Forte', fill: TOKYO_COLORS.yellow, fontSize: 10 }} />
          <ReferenceLine y={THRESHOLDS.EXTREME} stroke={TOKYO_COLORS.red} strokeDasharray="3 3" label={{ position: 'right', value: 'Violenta', fill: TOKYO_COLORS.red, fontSize: 10 }} />

          <Area 
            type="monotone" 
            dataKey="diff" 
            stroke={TOKYO_COLORS.accent} 
            fillOpacity={1} 
            fill="url(#colorDiff)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};