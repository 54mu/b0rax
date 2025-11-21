import React from 'react';
import { Thermometer, Droplets, Wind, Navigation, CloudRain, CloudSnow, Sun, User } from 'lucide-react';
import { CurrentSnapshot } from '../types';
import { TOKYO_COLORS } from '../constants';

interface Props {
  data: CurrentSnapshot;
}

export const CityComparison: React.FC<Props> = ({ data }) => {
  const { trieste } = data;
  
  // Determine Weather Icon
  const isRaining = trieste.precipitation > 0;
  // Simple WMO code check: 71, 73, 75, 77, 85, 86 are Snow
  const isSnowing = [71, 73, 75, 77, 85, 86].includes(trieste.weatherCode);
  
  let WeatherIcon = Sun;
  let weatherColor = TOKYO_COLORS.yellow;
  let conditionText = "Sereno";

  if (isSnowing) {
      WeatherIcon = CloudSnow;
      weatherColor = "#fff";
      conditionText = "Neve";
  } else if (isRaining) {
      WeatherIcon = CloudRain;
      weatherColor = TOKYO_COLORS.accent;
      conditionText = "Pioggia";
  }

  // Determine if Wind Chill is significantly different (e.g. > 1 degree difference)
  const showWindChill = trieste.temp - trieste.windChill > 0.5;

  return (
    <div className="bg-tokyo-card/50 rounded-xl p-6 border border-white/5 mt-6 h-full">
      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
        <div>
            <h3 className="font-bold text-xl text-tokyo-fg">Meteo Trieste</h3>
            <p className="text-xs text-gray-500 mt-1">Condizioni locali attuali</p>
        </div>
        <div className="flex flex-col items-end">
             <WeatherIcon className="w-8 h-8 mb-1" style={{ color: weatherColor }} />
             <span className="text-xs font-medium" style={{ color: weatherColor }}>{conditionText}</span>
        </div>
      </div>
      
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-400">
              <div className="p-2 bg-tokyo-bg rounded-lg">
                <Thermometer className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Temperatura</span>
          </div>
          <span className="font-mono text-xl font-bold text-tokyo-red">{trieste.temp}°C</span>
        </div>

        {showWindChill && (
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-tokyo-purple">
                <div className="p-2 bg-tokyo-bg rounded-lg">
                    <User className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Wind Chill</span>
            </div>
            <span className="font-mono text-xl font-bold text-tokyo-purple">{trieste.windChill}°C</span>
            </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-400">
              <div className="p-2 bg-tokyo-bg rounded-lg">
                <Droplets className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Umidità</span>
          </div>
          <span className="font-mono text-xl font-bold text-tokyo-cyan">{trieste.humidity}%</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-400">
              <div className="p-2 bg-tokyo-bg rounded-lg">
                <Wind className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Vento Locale</span>
          </div>
          <span className="font-mono text-xl font-bold text-tokyo-yellow">{trieste.windSpeed} km/h</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-400">
              <div className="p-2 bg-tokyo-bg rounded-lg">
                 <Navigation className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Pressione</span>
          </div>
          <span className="font-mono text-xl font-bold text-white">{trieste.pressure} hPa</span>
        </div>

        {(isRaining || isSnowing) && (
            <div className="mt-4 p-3 bg-tokyo-bg/50 border border-tokyo-fg/10 rounded-lg flex justify-between items-center">
                <span className="text-xs text-gray-400">Precipitazioni</span>
                <span className="text-sm font-mono text-tokyo-accent">{trieste.precipitation} mm</span>
            </div>
        )}
      </div>
    </div>
  );
};