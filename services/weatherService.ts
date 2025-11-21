import { OpenMeteoResponse, BoraDataPoint, CurrentSnapshot, CityConditions } from '../types';
import { TRIESTE_COORDS, MARIBOR_COORDS, getTimeOfDay, calculateWindChill } from '../constants';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

interface WeatherDataResult {
  chartData: BoraDataPoint[];
  currentConditions: CurrentSnapshot;
}

const fetchCityData = async (lat: number, lon: number): Promise<OpenMeteoResponse> => {
  // Fetch current pressure, temp, humidity, wind, precipitation and weather code
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: 'pressure_msl,temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code',
    timezone: 'Europe/Rome'
  });

  const response = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Errore connessione OpenMeteo');
  }
  return await response.json();
};

export const fetchWeatherData = async (): Promise<WeatherDataResult> => {
  try {
    const [triesteData, mariborData] = await Promise.all([
      fetchCityData(TRIESTE_COORDS.lat, TRIESTE_COORDS.lon),
      fetchCityData(MARIBOR_COORDS.lat, MARIBOR_COORDS.lon)
    ]);

    const processedData: BoraDataPoint[] = [];
    const now = new Date();
    const currentHourIndex = triesteData.hourly.time.findIndex(t => new Date(t).getHours() === now.getHours() && new Date(t).getDate() === now.getDate());
    
    // Fallback if exact hour not found
    const idx = currentHourIndex !== -1 ? currentHourIndex : 0;

    // --- Process Chart Data (Next 5 days) ---
    const limit = Math.min(triesteData.hourly.time.length, mariborData.hourly.time.length, 120); // ~5 days

    for (let i = idx; i < limit; i++) {
        const tPressure = triesteData.hourly.pressure_msl[i];
        const mPressure = mariborData.hourly.pressure_msl[i];
        const precip = triesteData.hourly.precipitation[i];
        const wCode = triesteData.hourly.weather_code[i];
        const timeStr = triesteData.hourly.time[i];
        const date = new Date(timeStr);

        if (tPressure !== undefined && mPressure !== undefined) {
            const diff = mPressure - tPressure;
            
            // Dark Bora definition: Positive Diff (Bora) + Precipitation > 0
            // Strictly speaking Bora Scura is usually associated with low pressure in the Adriatic, 
            // but for this visualization we simply check if it's raining while Bora blows.
            const isDarkBora = diff > 2 && precip > 0;

            processedData.push({
                timestamp: date.getTime(),
                dateStr: date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' }),
                triestePressure: tPressure,
                mariborPressure: mPressure,
                diff: parseFloat(diff.toFixed(1)),
                timeOfDay: getTimeOfDay(date),
                precipitation: precip,
                weatherCode: wCode,
                isDarkBora
            });
        }
    }

    // --- Process Current Conditions (Trieste Only) ---
    const currentTemp = triesteData.hourly.temperature_2m[idx];
    const currentWind = triesteData.hourly.wind_speed_10m[idx];

    const currentTrieste: CityConditions = {
        temp: currentTemp,
        windChill: calculateWindChill(currentTemp, currentWind),
        humidity: triesteData.hourly.relative_humidity_2m[idx],
        windSpeed: currentWind,
        pressure: triesteData.hourly.pressure_msl[idx],
        precipitation: triesteData.hourly.precipitation[idx],
        weatherCode: triesteData.hourly.weather_code[idx]
    };

    return {
        chartData: processedData,
        currentConditions: {
            trieste: currentTrieste,
            // maribor detail excluded from UI object as requested
        }
    };

  } catch (error) {
    console.error("Fetch Error:", error);
    throw error;
  }
};

// Mock data generator 
export const getMockData = (): BoraDataPoint[] => {
  const now = new Date();
  const data: BoraDataPoint[] = [];
  
  for (let i = 0; i < 40; i++) { 
    const time = new Date(now.getTime() + i * 3 * 60 * 60 * 1000);
    const baseDiff = 2;
    const wave = Math.sin(i / 5) * 8; 
    const noise = Math.random() * 1;
    const diff = baseDiff + wave + noise;
    const isRainy = Math.random() > 0.7;
    
    data.push({
      timestamp: time.getTime(),
      dateStr: time.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' }),
      triestePressure: 1010 - (diff / 2),
      mariborPressure: 1010 + (diff / 2),
      diff: parseFloat(diff.toFixed(1)),
      timeOfDay: getTimeOfDay(time),
      precipitation: isRainy ? Math.random() * 5 : 0,
      weatherCode: isRainy ? 61 : 0,
      isDarkBora: diff > 2 && isRainy
    });
  }
  return data;
};