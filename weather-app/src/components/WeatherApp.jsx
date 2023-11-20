import React, { useState } from "react";
import axios from "axios";
import { BallTriangle } from "react-loader-spinner";

const API_KEY = process.env.REACT_APP_API_KEY_VALUE;
const API_URL_WEATHER = "https://api.openweathermap.org/data/2.5/forecast?";
const API_URL_GEO = "http://api.openweathermap.org/geo/1.0/direct?";

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);   
  const [inputValue, setInputValue] = useState("");
  const [averageTemp, setAverageTemp] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Функция для загрузки данных о геолокации с API
  const fetchGeo = async () => {
    try {
      const response = await axios.get(API_URL_GEO, {
        params: {
          q: city,
          limit: 5,
          appid: API_KEY,
        }
      });
        setCity(response.data[0].name);
    } catch (error) {
      console.error("Ошибка при загрузке данных геолокации", error);
    }
  };

  // Функция для загрузки данных о погоде с API
  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL_WEATHER, {
        params: {
          q: city,
          appid: API_KEY,
          units: "metric",
          cnt: 40,
      },
    });
      setWeatherData(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке данных о погоде", error);
    }
    }

  // Функция для разделения данных о погоде на дни
    const divideDataByDays = () => {
      if (weatherData) {
        const days = {};
        weatherData.list.forEach(item => {
          const date = item.dt_txt.split(' ')[0];
          if (!days[date]) {
            days[date] = [];
          }
          days[date].push(item);
        });
        console.log(days);
        return days;
        
      }
    };

  // Функция для вычисления средней температуры для каждого дня
  const calculateAverageTemp = () => {
    const days = divideDataByDays();
    if (days) {
      const averageTemp = {};
      Object.keys(days).forEach(date => {
        const totalTemp = days[date].reduce((acc, curr) => acc + curr.main.temp, 0);
        averageTemp[date] = totalTemp / days[date].length;
      });
      setAverageTemp(averageTemp);
      console.log(averageTemp)
    }
  };

  const handleInputChange = async (e) => {
    setInputValue(e.target.value);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      setCity(inputValue)
      fetchGeo();
      fetchData();
      calculateAverageTemp();
    } catch (error) {
      console.error("Ошибка при загрузке данных", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <header>Погода</header>
      <input 
        className="input-city"
        placeholder={"Введите город:"} 
        value={inputValue} 
        onChange={handleInputChange} 
      />
      <button onClick={handleSearch}>Искать</button>
      
      {isLoading && <BallTriangle type="Puff" color="#00BFFF" height={100} width={100} />}

      <h1>{city}</h1>
       {/* Вывод данных о текущей погоде  */}
      {weatherData && (
        <div>
          {weatherData.list.slice(0, 1).map(current => {
            const temp = Math.round(current.main.temp)
            const weather = current.weather[0].description
            return (
              <div>
              <p className="current-temp">{temp}°C</p>
              <p className="current-weather">{weather}</p>
              </div>
            )
          })}
        </div>
      )}
      <div>
        {weatherData && (
          <h2> Прогноз на 24 часа </h2>
        )}
        {weatherData && weatherData.list && (
  <ul>
  {weatherData.list.slice(0, 8).map(forecast => {
    const time = forecast.dt_txt.substring(11, 16);
    const tempHours = Math.round(forecast.main.temp);
    return (
      <li key={forecast.dt}>
        {time} <p>{tempHours}°C</p>
      </li>
    );
  })}
  </ul>
)}
      </div>
      <div>
      {averageTemp && (
          <h2>Погода на 5 дней:</h2>
          )}
      {averageTemp && (
        <ul>
          {Object.keys(averageTemp).map(date => (       
              <li key={date}>
              {date} <p>{averageTemp[date].toFixed(1)}°C</p>
              </li>
          ))}
      </ul> 
      )}
      </div>
    </div>
  );
};

export default WeatherApp;
