// 初回
window.onload = () => {
  updateTime();
  setInterval(updateTime, 1000);
  getLocationWeather();
};

// 時刻
function updateTime() {
  const now = new Date();
  document.getElementById("time").textContent =
    now.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
}

// 現在地取得
function getLocationWeather() {
  if (!navigator.geolocation) {
    alert("位置情報が使えません");
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    fetchWeather(lat, lon);
  });
}

// 天気取得
async function fetchWeather(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia%2FTokyo`;

  const res = await fetch(url);
  const data = await res.json();

  updateUI(data.current_weather);
}

// weathercode → 日本語
function getWeatherText(code) {
  if (code === 0) return "快晴";
  if (code <= 3) return "晴れ";
  if (code <= 48) return "曇り";
  if (code <= 67) return "雨";
  if (code <= 77) return "雪";
  if (code <= 99) return "雷雨";
  return "不明";
}

// UI更新
function updateUI(weather) {
  const card = document.getElementById("card");
  card.classList.remove("hidden");

  document.getElementById("temp").textContent =
    `🌡 ${weather.temperature}℃`;

  document.getElementById("desc").textContent =
    getWeatherText(weather.weathercode);

  document.getElementById("extra").textContent =
    `🌬 ${weather.windspeed} km/h`;

  changeBackground(weather.weathercode);
}

// 背景変更
function changeBackground(code) {
  const body = document.getElementById("body");
  body.className = "";

  const hour = new Date().getHours();

  // 夜
  if (hour < 6 || hour > 18) {
    body.classList.add("night");
    return;
  }

  if (code === 0) body.classList.add("clear");
  else if (code <= 3) body.classList.add("clear");
  else if (code <= 48) body.classList.add("clouds");
  else if (code <= 67) body.classList.add("rain");
  else if (code <= 77) body.classList.add("snow");
  else body.classList.add("rain");
}
