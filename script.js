const apiKey = "7fe7085f380ae854c244aa87103ef647";

const cityInput = document.getElementById("cityInput");
const suggestionsBox = document.getElementById("suggestions");
const result = document.getElementById("weatherResult");

/* ===============================
   CITY AUTOCOMPLETE (SUGGESTIONS)
   =============================== */
cityInput.addEventListener("input", () => {
    const query = cityInput.value.trim();

    if (query.length < 2) {
        suggestionsBox.innerHTML = "";
        return;
    }

    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`)
        .then(res => res.json())
        .then(data => {
            suggestionsBox.innerHTML = "";

            data.forEach(city => {
                const div = document.createElement("div");
                div.textContent = `${city.name}, ${city.country}`;
                div.onclick = () => {
                    cityInput.value = city.name;
                    suggestionsBox.innerHTML = "";
                };
                suggestionsBox.appendChild(div);
            });
        });
});

/* ===============================
   SET WEATHER BACKGROUND THEME
   =============================== */
function setWeatherTheme(condition) {
    document.body.className = "";

    if (condition.includes("clear")) document.body.classList.add("clear");
    else if (condition.includes("cloud")) document.body.classList.add("clouds");
    else if (condition.includes("rain")) document.body.classList.add("rain");
    else if (condition.includes("snow")) document.body.classList.add("snow");
}

/* ===============================
   FETCH WEATHER BY CITY NAME
   =============================== */
function getWeather() {
    const city = cityInput.value.trim();
    suggestionsBox.innerHTML = "";

    if (!city) {
        result.innerHTML = "Please enter a city name.";
        return;
    }

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
        .then(res => res.json())
        .then(showWeather)
        .catch(() => {
            result.innerHTML = "Error fetching weather data.";
        });
}

/* ===============================
   FETCH WEATHER BY CURRENT LOCATION
   =============================== */
function getCurrentLocation() {
    if (!navigator.geolocation) {
        result.innerHTML = "Geolocation not supported.";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
                .then(res => res.json())
                .then(showWeather);
        },
        () => {
            result.innerHTML = "Location access denied.";
        }
    );
}

function showWeather(data) {
    if (data.cod != 200) {
        result.innerHTML = "City not found.";
        return;
    }

    // ✅ PERFECT LOCAL TIME
    const localTime = new Date(
        (Date.now() + new Date().getTimezoneOffset() * 60000) +
        data.timezone * 1000
    );

    const dateStr = localTime.toLocaleDateString();
    const timeStr = localTime.toLocaleTimeString();
    const hour = localTime.getHours();

    // 🌞 / 🌙 DAY-NIGHT LOGIC
    const isDay = hour >= 6 && hour < 18;
    const dayNightIcon = isDay
        ? '<span class="day-icon">🌞</span>'
        : '<span class="night-icon">🌙</span>';

    // Weather condition theme
    const condition = data.weather[0].main.toLowerCase();
    setWeatherTheme(condition);

    // 🌙 NIGHT OVERRIDE
    if (!isDay) {
        document.body.classList.add("night");
    }

    const icon = data.weather[0].icon;

    result.innerHTML = `
        <h2>
            ${data.name}, ${data.sys.country}
            ${dayNightIcon}
        </h2>
        <p><strong>Date:</strong> ${dateStr}</p>
        <p><strong>Local Time:</strong> ${timeStr}</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather Icon">
        <p><strong>${data.weather[0].description}</strong></p>
        <p>🌡 Temperature: ${data.main.temp} °C</p>
        <p>💧 Humidity: ${data.main.humidity}%</p>
        <p>🌬 Wind Speed: ${data.wind.speed} m/s</p>
    `;
}
