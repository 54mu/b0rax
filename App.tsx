import React, { useState, useEffect, useMemo } from 'react';
import { Wind, AlertTriangle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

import { BoraDataPoint, CurrentSnapshot } from './types';
import { fetchWeatherData, getMockData } from './services/weatherService';
import { generateBoraAnalysis } from './services/geminiService';
import { THRESHOLDS, TOKYO_COLORS, getBoraIntensity, getIntensityColor } from './constants';
import { PressureChart } from './components/PressureChart';
import { StatCard } from './components/StatCard';
import { CityComparison } from './components/CityComparison';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BoraDataPoint[]>([]);
  const [currentConditions, setCurrentConditions] = useState<CurrentSnapshot | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data effect
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      setAiAnalysis('');
      
      try {
        const result = await fetchWeatherData();
        setData(result.chartData);
        setCurrentConditions(result.currentConditions);
        
        // Trigger AI analysis if data exists
        if (result.chartData.length > 0) {
            setLoadingAi(true);
            generateBoraAnalysis(result.chartData)
                .then(text => setAiAnalysis(text))
                .finally(() => setLoadingAi(false));
        }

      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Errore nel caricamento dei dati Open-Meteo.');
        // Fallback to mock data on error for visual stability if desired, 
        // but explicitly showing error is better for debugging.
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Derived Statistics
  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const current = data[0];
    const max = [...data].sort((a, b) => b.diff - a.diff)[0];
    const intensity = getBoraIntensity(current.diff);
    
    return {
      current,
      max,
      intensity
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-tokyo-bg text-tokyo-fg p-4 md:p-8 font-sans">
      
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-tokyo-card rounded-lg border border-white/10 shadow-lg shadow-tokyo-accent/10">
            <Wind className="text-tokyo-accent w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">BoraWatch</h1>
            <p className="text-xs text-tokyo-fg/60">Monitoraggio Pressione Trieste-Maribor (Open-Meteo)</p>
          </div>
        </div>
        {/* No settings button needed for Open-Meteo */}
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto space-y-6">
        
        {loading && (
          <div className="text-center py-20 animate-pulse">
            <Wind className="w-12 h-12 text-tokyo-accent mx-auto mb-4 animate-spin-slow" />
            <p>Recupero dati da Open-Meteo in corso...</p>
          </div>
        )}

        {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg text-red-200 text-center">
                {error}
            </div>
        )}

        {!loading && stats && (
          <>
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Current Status */}
              <StatCard 
                title="Differenza Attuale"
                value={`${stats.current.diff.toFixed(1)} hPa`}
                subtitle={stats.intensity}
                color={getIntensityColor(stats.intensity)}
                icon={<Wind className="w-8 h-8" />}
                className="md:col-span-1"
              />

              {/* Max Forecast */}
              <StatCard 
                title="Picco Previsto (5gg)"
                value={`${stats.max.diff.toFixed(1)} hPa`}
                subtitle={`${format(new Date(stats.max.timestamp), 'EEEE d HH:mm', { locale: it })} (${stats.max.timeOfDay})`}
                color={TOKYO_COLORS.purple}
                icon={<AlertTriangle className="w-8 h-8" />}
                className="md:col-span-1"
              />

              {/* AI Insight */}
              <div className="bg-gradient-to-br from-tokyo-card to-tokyo-bg rounded-xl p-6 border border-tokyo-accent/20 shadow-lg relative md:col-span-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-tokyo-accent uppercase tracking-wider">L'Oracolo (Gemini AI)</span>
                </div>
                {loadingAi ? (
                    <div className="h-20 flex items-center justify-center text-xs text-gray-500">Generazione analisi...</div>
                ) : (
                    <p className="text-sm italic text-gray-300 leading-relaxed">"{aiAnalysis}"</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2">
                    <PressureChart data={data} />
                </div>
                
                {/* City Comparison Detail */}
                <div className="lg:col-span-1">
                    {currentConditions && <CityComparison data={currentConditions} />}
                </div>
            </div>

            {/* Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 opacity-70">
                <div className="flex gap-4 items-start">
                    <Info className="w-5 h-5 mt-1 shrink-0 text-tokyo-accent" />
                    <p className="text-sm">
                        La Bora nasce dalla differenza di pressione tra l'entroterra (Maribor) e il mare (Trieste). 
                        Più alta è la differenza (Maribor &gt; Trieste), più forte soffia il vento.
                    </p>
                </div>
                <div className="text-xs space-y-1 font-mono text-right">
                    <div className="text-tokyo-green">Moderata &gt; {THRESHOLDS.MODERATE} hPa</div>
                    <div className="text-tokyo-yellow">Forte &gt; {THRESHOLDS.STRONG} hPa</div>
                    <div className="text-tokyo-red">Violenta &gt; {THRESHOLDS.EXTREME} hPa</div>
                </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;