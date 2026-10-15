
import { WAQI_TOKEN } from "./constants";

export async function detectLocationAndAQI() {
  try {
    const pos = await new Promise<GeolocationPosition>((res, rej) => 
      navigator.geolocation.getCurrentPosition(res, rej, { 
        enableHighAccuracy: true, 
        timeout: 15000,
        maximumAge: 0
      })
    ).catch(() => null);

    let latitude = 28.6139; // Default to Delhi
    let longitude = 77.2090;

    if (pos) {
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;
    }

    // Fetch AQI from WAQI API
    let aqiData = { aqi: 0, iaqi: {} };
    try {
      const aqiRes = await fetch(`https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${WAQI_TOKEN}`);
      if (aqiRes.ok) {
        aqiData = await aqiRes.json();
      } else {
        console.error("WAQI API error:", aqiRes.status);
      }
    } catch (err) {
      console.error("WAQI API fetch failed:", err);
    }

    // Fetch Address from Nominatim (OpenStreetMap)
    let address = {};
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
        { 
          headers: { 
            'User-Agent': 'EcoLearnAI/1.1',
            'Accept': 'application/json'
          }
        }
      );
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        address = geoData.address || {};
      } else {
        console.error("Nominatim API error:", geoRes.status);
      }
    } catch (err) {
      console.error("Nominatim API fetch failed:", err);
    }
    
    // PRIORITY for Exact Area detection
    const area = address.road ||
                 address.neighbourhood || 
                 address.suburb || 
                 address.residential ||
                 address.hamlet ||
                 address.village || 
                 address.subdistrict ||
                 address.quarter || 
                 address.city_district || 
                 "Local Area";
                 
    const city = address.city || address.town || address.village || address.county || address.state || "Detected City";

    return {
      area,
      city,
      latitude,
      longitude,
      aqi: aqiData.data || { aqi: 0, iaqi: {} }
    };
  } catch (error) {
    console.error("Location detection failed, returning defaults", error);
    return {
      area: "Connaught Place",
      city: "Delhi",
      latitude: 28.6139,
      longitude: 77.2090,
      aqi: { aqi: 150, iaqi: { pm25: { v: 110 }, t: { v: 24.5 } } }
    };
  }
}
