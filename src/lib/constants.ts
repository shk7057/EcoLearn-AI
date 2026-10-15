
export const WAQI_TOKEN = process.env.NEXT_PUBLIC_WAQI_TOKEN || "";
export const GROQ_KEY = process.env.NEXT_PUBLIC_GROQ_KEY || "";

export const CITY_STATIONS = {
  delhi: "@2553",
  gurugram: "@2554",
  noida: "@8179",
  mumbai: "@3987",
  bangalore: "@4003",
  hyderabad: "@4001",
  chennai: "@4000",
  kolkata: "@3999"
};

export const HOUR_PATTERN = [
  0.75, 0.70, 0.68, 0.65, 0.68, 0.75,
  0.90, 1.20, 1.35, 1.15, 1.00, 0.90,
  0.85, 0.82, 0.85, 0.90, 1.00, 1.25,
  1.40, 1.35, 1.20, 1.10, 0.95, 0.82
];

export const AQI_LEVELS = [
  { max: 50, label: 'Good', color: '#2ecc71', status: '🟢' },
  { max: 100, label: 'Moderate', color: '#f1c40f', status: '🟡' },
  { max: 150, label: 'Unhealthy for Sensitive Groups', color: '#e67e22', status: '🟠' },
  { max: 200, label: 'Unhealthy', color: '#e74c3c', status: '🔴' },
  { max: 300, label: 'Very Unhealthy', color: '#9b59b6', status: '🟣' },
  { max: 1000, label: 'Hazardous', color: '#8e44ad', status: '🟤' }
];

export function getAqiStatus(aqi: number) {
  return AQI_LEVELS.find(l => aqi <= l.max) || AQI_LEVELS[AQI_LEVELS.length - 1];
}
