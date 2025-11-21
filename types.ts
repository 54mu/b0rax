export interface WeatherConfig {
  // OpenMeteo does not require a key for basic usage
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    pressure_msl: number[];
    wind_speed_10m: number[];
    precipitation: number[];
    weather_code: number[];
  };
}

export interface BoraDataPoint {
  timestamp: number;
  dateStr: string;
  triestePressure: number;
  mariborPressure: number;
  diff: number; // Maribor - Trieste
  timeOfDay: string; // Mattina, Pomeriggio, Sera, Notte
  precipitation: number;
  weatherCode: number;
  isDarkBora: boolean;
}

export interface CityConditions {
  temp: number;
  windChill: number; // Perceived temperature
  humidity: number;
  windSpeed: number;
  pressure: number;
  precipitation: number;
  weatherCode: number;
}

export interface CurrentSnapshot {
  trieste: CityConditions;
  // maribor: CityConditions; // Removed Maribor specific details as per request
}

export interface AnalysisResult {
  maxDiff: number;
  maxDate: string;
  maxTimeOfDay: string;
  currentDiff: number;
  advice: string;
}

export enum BoraIntensity {
  NONE = 'Assente',
  WEAK = 'Debole',
  MODERATE = 'Moderata',
  STRONG = 'Forte',
  EXTREME = 'Violenta'
}