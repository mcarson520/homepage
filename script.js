// script.js

// Weather code to icon mapping
function getWeatherIcon(code) {
    const weatherIcons = {
        0: '☀️',    // Clear sky
        1: '🌤️',    // Mainly clear
        2: '⛅',    // Partly cloudy
        3: '☁️',    // Overcast
        45: '🌫️',   // Foggy
        48: '🌫️',   // Depositing rime fog
        51: '🌦️',   // Light drizzle
        53: '🌦️',   // Moderate drizzle
        55: '🌦️',   // Dense drizzle
        61: '🌧️',   // Slight rain
        63: '🌧️',   // Moderate rain
        65: '🌧️',   // Heavy rain
        71: '🌨️',   // Slight snow
        73: '🌨️',   // Moderate snow
        75: '🌨️',   // Heavy snow
        77: '🌨️',   // Snow grains
        80: '🌦️',   // Slight rain showers
        81: '🌦️',   // Moderate rain showers
        82: '🌧️',   // Violent rain showers
        85: '🌨️',   // Slight snow showers
        86: '🌨️',   // Heavy snow showers
        95: '⛈️',   // Thunderstorm
        96: '⛈️',   // Thunderstorm with slight hail
        99: '⛈️'    // Thunderstorm with heavy hail
    };
    
    return weatherIcons[code] || '❓';
}

// Get city name from coordinates using reverse geocoding
async function getCityName(lat, lon) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const data = await response.json();
        
        const city = data.address.city || data.address.town || data.address.village || data.address.municipality;
        const country = data.address.country;
        
        return `${city || 'Unknown'}, ${country || ''}`;
    } catch (error) {
        console.error('Geocoding error:', error);
        return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
    }
}

async function getWeather() {
    const loadingEl = document.getElementById('weather-loading');
    const contentEl = document.getElementById('weather-content');
    const errorEl = document.getElementById('weather-error');
    
    try {
        // Get user's location
        loadingEl.textContent = 'Getting your location...';
        
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        loadingEl.textContent = 'Loading weather data...';
        
        // Fetch weather from Open-Meteo (no API key needed!)
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto&temperature_unit=fahrenheit`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }
        
        const data = await response.json();
        
        // Get city name
        const cityName = await getCityName(lat, lon);
        
        // Update the UI
        document.getElementById('temp').textContent = Math.round(data.current.temperature_2m);
        document.getElementById('feels-like').textContent = Math.round(data.current.apparent_temperature);
        document.getElementById('location').textContent = cityName;
        document.getElementById('humidity').textContent = data.current.relative_humidity_2m;
        document.getElementById('wind').textContent = Math.round(data.current.wind_speed_10m);
        
        // Set weather icon based on weather code
        document.getElementById('weather-icon').textContent = getWeatherIcon(data.current.weather_code);
        
        // Show content, hide loading
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
        
    } catch (error) {
        console.error('Weather error:', error);
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        
        if (error.code === 1) {
            errorEl.textContent = 'Please enable location access to see weather.';
        } else {
            errorEl.textContent = 'Unable to load weather data. Please try again later.';
        }
    }
}

// Load weather when page loads
document.addEventListener('DOMContentLoaded', getWeather);

// Optional: Refresh weather every 10 minutes
setInterval(getWeather, 600000);