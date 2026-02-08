async function getFreeWeatherData(latitude, longitude) {
    try {
        // Open-Meteo API - Completely FREE, no API key needed
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Africa/Algiers`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.current_weather) return null;

        return {
            current: {
                temp: data.current_weather.temperature,
                windSpeed: data.current_weather.windspeed,
                weatherCode: data.current_weather.weathercode,
                condition: getWeatherDescription(data.current_weather.weathercode).ar
            },
            daily: {
                maxTemp: data.daily.temperature_2m_max[0],
                minTemp: data.daily.temperature_2m_min[0],
                precipitation: data.daily.precipitation_sum[0],
                weatherCode: data.daily.weathercode[0]
            },
            forecast: data.daily.temperature_2m_max.slice(0, 4).map((temp, i) => ({
                day: getDayName(i),
                maxTemp: temp,
                minTemp: data.daily.temperature_2m_min[i],
                precipitation: data.daily.precipitation_sum[i],
                condition: getWeatherDescription(data.daily.weathercode[i]).ar,
                icon: getWeatherDescription(data.daily.weathercode[i]).icon
            }))
        };
    } catch (error) {
        console.error('Weather fetch failed:', error);
        return null;
    }
}

// Weather code interpretation (WMO codes)
function getWeatherDescription(code) {
    const weatherCodes = {
        0: { ar: 'صافي', icon: '☀️' },
        1: { ar: 'صافي جزئياً', icon: '🌤️' },
        2: { ar: 'غائم جزئياً', icon: '⛅' },
        3: { ar: 'غائم', icon: '☁️' },
        45: { ar: 'ضباب', icon: '🌫️' },
        48: { ar: 'ضباب متجمد', icon: '🌫️' },
        51: { ar: 'رذاذ خفيف', icon: '🌦️' },
        61: { ar: 'مطر خفيف', icon: '🌧️' },
        63: { ar: 'مطر متوسط', icon: '🌧️' },
        65: { ar: 'مطر غزير', icon: '⛈️' },
        71: { ar: 'ثلج خفيف', icon: '🌨️' },
        95: { ar: 'عاصفة رعدية', icon: '⛈️' }
    };

    return weatherCodes[code] || { ar: 'غير معروف', icon: '🌡️' };
}

function getDayName(daysFromNow) {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return days[date.getDay()];
}

module.exports = { getFreeWeatherData, getWeatherDescription };
