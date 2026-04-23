const API_KEY = "5b2ded8cf85d92486c2c5e363fd9831a";

// 初回で現在地取得
window.onload = () => {
  getLocationWeather();
};

// 都市検索
async function getWeather() {
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

// 共通取得
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
}
