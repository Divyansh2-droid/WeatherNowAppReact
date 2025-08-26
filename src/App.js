import { useState, useEffect, useCallback } from "react";
import SearchBar from "./components/SearchBar";
import WeatherCard from "./components/WeatherCard";
import Forecast from "./components/Forecast";
import "./App.css";

function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [city, setCity] = useState("Your Location");
  const [bgClass, setBgClass] = useState("default-bg");

  // ✅ Env variables
  const WEATHER_API = process.env.REACT_APP_WEATHER_API;
  const GEO_API = process.env.REACT_APP_GEO_API;

  const updateBackground = useCallback((code) => {
    if (!code) return;

    let className = "default-bg";
    if (code >= 0 && code <= 3) {
      className = "sunny-bg";
    } else if (code >= 45 && code <= 67) {
      className = "cloudy-bg";
    } else if (code >= 71 && code <= 77) {
      className = "snowy-bg";
    } else if (code >= 80 && code <= 99) {
      className = "rainy-bg";
    }

    document.body.className = className;
  }, []);

  const fetchWeatherByCoords = useCallback(
    async (lat, lon) => {
      try {
        const res = await fetch(
          `${WEATHER_API}?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
        );
        const data = await res.json();

        setWeather(data.current_weather);
        setForecast(data.daily);
        updateBackground(data.current_weather.weathercode);
      } catch (err) {
        console.error(err);
        alert("Unable to fetch weather.");
      }
    },
    [updateBackground, WEATHER_API]
  );

  const fetchWeatherByCity = async (cityName) => {
    try {
      const geoRes = await fetch(`${GEO_API}?format=json&q=${cityName}`);
      const geoData = await geoRes.json();

      if (!geoData[0]) {
        alert("City not found!");
        return;
      }

      const lat = geoData[0].lat;
      const lon = geoData[0].lon;

      fetchWeatherByCoords(lat, lon);
      setCity(cityName);
    } catch (error) {
      console.error(error);
      alert("Error fetching city weather.");
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          fetchWeatherByCoords(lat, lon);
          setCity("Your Location");
        },
        (err) => {
          console.error(err);
          alert("Location access denied. Please search manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }, [fetchWeatherByCoords]);

  return (
    <div className="App">
      <h1>Weather Now</h1>
      <SearchBar onSearch={fetchWeatherByCity} />
      {weather && <WeatherCard city={city} weather={weather} />}
      {forecast && <Forecast forecast={forecast} />}
    </div>
  );
}

export default App;
