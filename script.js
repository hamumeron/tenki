const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let width, height;
let clouds = [];
let rainDrops = [];
let weatherType = "clear";
let wind = 0;

const rainSound = document.getElementById("rainSound");
const thunderSound = document.getElementById("thunderSound");
let soundOn = false;

// 初期化
function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.onresize = resize;
resize();

// 時刻
setInterval(() => {
  document.getElementById("time").textContent =
    new Date().toLocaleTimeString("ja-JP");
}, 1000);

// 雲生成
function createClouds() {
  clouds = [];
  for (let i = 0; i < 20; i++) {
    clouds.push({
      x: Math.random() * width,
      y: Math.random() * height / 2,
      size: 50 + Math.random() * 100,
      speed: 0.2 + Math.random()
    });
  }
}

// 雨生成
function createRain() {
  rainDrops = [];
  for (let i = 0; i < 300; i++) {
    rainDrops.push({
      x: Math.random() * width,
      y: Math.random() * height,
      len: 10 + Math.random() * 20,
      speed: 4 + Math.random() * 4
    });
  }
}

// 描画
function draw() {
  ctx.clearRect(0, 0, width, height);

  // 雲
  if (weatherType === "clouds" || weatherType === "clear") {
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    clouds.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
      ctx.fill();

      c.x += c.speed;
      if (c.x > width + 100) c.x = -100;
    });
  }

  // 雨
  if (weatherType === "rain" || weatherType === "thunder") {
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1;

    rainDrops.forEach(r => {
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x + wind, r.y + r.len);
      ctx.stroke();

      r.x += wind * 0.1;
      r.y += r.speed;

      if (r.y > height) {
        r.y = -10;
        r.x = Math.random() * width;
      }
    });
  }

  requestAnimationFrame(draw);
}

// 雷
function lightning() {
  if (weatherType !== "thunder") return;

  if (Math.random() < 0.01) {
    document.body.style.background = "white";

    if (soundOn) thunderSound.play();

    setTimeout(() => {
      document.body.style.background = "black";
    }, 100);
  }
}

// 音切替
function toggleSound() {
  soundOn = !soundOn;

  if (soundOn && weatherType === "rain") {
    rainSound.play();
  } else {
    rainSound.pause();
  }
}

// 天気取得（Open-Meteo）
function getLocationWeather() {
  navigator.geolocation.getCurrentPosition(pos => {
    fetchWeather(pos.coords.latitude, pos.coords.longitude);
  });
}

async function fetchWeather(lat, lon) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
  );
  const data = await res.json();

  const code = data.current_weather.weathercode;
  wind = data.current_weather.windspeed / 2;

  if (code === 0) weatherType = "clear";
  else if (code <= 3) weatherType = "clear";
  else if (code <= 48) weatherType = "clouds";
  else if (code <= 67) weatherType = "rain";
  else weatherType = "thunder";

  if (weatherType === "rain" && soundOn) rainSound.play();
  else rainSound.pause();

  createClouds();
  createRain();

  document.getElementById("card").classList.remove("hidden");
  document.getElementById("temp").textContent =
    `🌡 ${data.current_weather.temperature}℃`;
}

// ループ
setInterval(lightning, 100);
draw();
