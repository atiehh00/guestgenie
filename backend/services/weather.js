async function getWeather(city) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=de`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const description = data.weather[0].description;
    return `${data.name}: ${temp}°C, ${description}. Gefühlt ${feelsLike}°C.`;
  } catch {
    return null;
  }
}

module.exports = { getWeather };
