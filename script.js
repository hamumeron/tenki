const API_KEY = "23bf01617f919e68753ccaac1b9db719";

// 初回
window.onload = () => {
  updateTime();
  setInterval(updateTime, 1000);
  getLocationWeather();
};

// 時刻表示
function updateTime() {
  const now = new Date();
  const time = now.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  document.getElementById("time").textContent = time;
}

// 都市検索
function getWeather() {
  const city = document.getElementById("city").value;
  if (!city) return;
  fetchWeather(`q=${city}`);
}

// 現在地
function getLocationWeather() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    fetchWeather(`lat=${lat}&lon=${lon}`);
  });
}

// 共通
async function fetchWeather(query) {
  const card = document.getElementById("card");
  card.classList.remove("hidden");

  document.getElementById("cityName").textContent = "読み込み中...";

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?${query}&appid=${API_KEY}&units=metric&lang=ja`
    );
    const data = await res.json();

    updateUI(data);

  } catch {
    document.getElementById("cityName").textContent = "エラー";
  }
}

// UI更新
function updateUI(data) {
  document.getElementById("cityName").textContent = data.name;
  document.getElementById("temp").textContent = `${Math.round(data.main.temp)}℃`;
  document.getElementById("desc").textContent = data.weather[0].description;
  document.getElementById("extra").textContent =
    `湿度 ${data.main.humidity}% ・ 風速 ${data.wind.speed}m/s`;

  const icon = data.weather[0].icon;
  document.getElementById("icon").src =
    `https://openweathermap.org/img/wn/${icon}@2x.png`;

  changeBackground(data.weather[0].main, icon);
}

// 背景変更
function changeBackground(weather, icon) {
  const body = document.getElementById("body");

  body.className = "";

  // 夜判定（iconにnが含まれる）
  if (icon.includes("n")) {
    body.classList.add("night");
    return;
  }

  if (weather === "Clear") body.classList.add("clear");
  else if (weather === "Clouds") body.classList.add("clouds");
  else if (weather === "Rain") body.classList.add("rain");
  else if (weather === "Snow") body.classList.add("snow");
  else body.classList.add("clear");
}
