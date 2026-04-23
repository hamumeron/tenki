window.onload = () => {
  updateTime();
  setInterval(updateTime, 1000);
  getLocationWeather();
};

function updateTime() {
  const now = new Date();
  document.getElementById("time").textContent =
    now.toLocaleTimeString("ja-JP");
}

function getLocationWeather() {
  navigator.geolocation.getCurrentPosition(pos => {
    fetchWeather(pos.coords.latitude, pos.coords.longitude);
  });
}

async function fetchWeather(lat, lon) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia%2FTokyo`
  );
  const data = await res.json();

  updateUI(data.current_weather);
}

function getWeatherText(code) {
  if (code === 0) return "快晴";
  if (code <= 3) return "晴れ";
  if (code <= 48) return "曇り";
  if (code <= 67) return "雨";
  if (code <= 77) return "雪";
  if (code <= 99) return "雷雨";
}

function updateUI(w) {
  document.getElementById("card").classList.remove("hidden");

  document.getElementById("temp").textContent = `🌡 ${w.temperature}℃`;
  document.getElementById("desc").textContent = getWeatherText(w.weathercode);
  document.getElementById("extra").textContent = `🌬 ${w.windspeed} km/h`;

  setBackground(w.weathercode);
}

function setBackground(code) {
  const body = document.getElementById("body");
  body.className = "";

  const hour = new Date().getHours();

  if (hour < 6 || hour > 18) {
    body.classList.add("night");
    return;
  }

  if (code === 0) body.classList.add("clear");
  else if (code <= 3) body.classList.add("clear");
  else if (code <= 48) body.classList.add("clouds");
  else if (code <= 67) body.classList.add("rain");
  else if (code <= 77) body.classList.add("clouds");
  else body.classList.add("thunder");
}
