#!/usr/bin/env bun
import { defineFeature, registerFeatures } from "@xfeature/core";

// Define weather app features
const Feature = registerFeatures({
  // Weather display features
  Display: defineFeature("display", {
    // Show temperature in Celsius or Fahrenheit
    Celsius: defineFeature("celsius"),
    // Show weather alerts
    Alerts: defineFeature("alerts"),
  }),

  // Advanced features
  Advanced: defineFeature("advanced", {
    // Show hourly forecast
    Forecast: defineFeature("forecast"),
    // Show air quality index
    AirQuality: defineFeature("air-quality"),
  }),
});

// Simulate weather data
const weatherData = {
  temperature: 22,
  condition: "Sunny",
  alerts: ["UV Index High"],
  hourly: [
    { time: "12:00", temp: 22, condition: "Sunny" },
    { time: "13:00", temp: 23, condition: "Sunny" },
    { time: "14:00", temp: 24, condition: "Partly Cloudy" },
  ],
  airQuality: "Good",
};

// Display weather information based on enabled features
function displayWeather() {
  console.log("🌤️  Weather Report\n");

  // Basic temperature display
  const temp = Feature.Display.Celsius.$isEnabled()
    ? `${weatherData.temperature}°C`
    : `${((weatherData.temperature * 9) / 5 + 32).toFixed(1)}°F`;

  console.log(`Current Temperature: ${temp}`);
  console.log(`Condition: ${weatherData.condition}`);

  // Show alerts if enabled
  if (Feature.Display.Alerts.$isEnabled()) {
    console.log("\n⚠️  Alerts:");
    for (const alert of weatherData.alerts) {
      console.log(`- ${alert}`);
    }
  }

  // Show hourly forecast if enabled
  if (Feature.Advanced.Forecast.$isEnabled()) {
    console.log("\n📅 Hourly Forecast:");
    for (const hour of weatherData.hourly) {
      const hourTemp = Feature.Display.Celsius.$isEnabled()
        ? `${hour.temp}°C`
        : `${((hour.temp * 9) / 5 + 32).toFixed(1)}°F`;
      console.log(`${hour.time}: ${hourTemp} - ${hour.condition}`);
    }
  }

  // Show air quality if enabled
  if (Feature.Advanced.AirQuality.$isEnabled()) {
    console.log(`\n🌬️  Air Quality: ${weatherData.airQuality}`);
  }
}

// Display the weather report
displayWeather();
