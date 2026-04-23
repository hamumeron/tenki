// ===== Three.js（ES Modules）=====
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

// ===== 先に変数定義（重要）=====
let windX = 0;
let rain = [];
let splashes = [];

// ===== Canvas =====
const canvas = document.getElementById("rainCanvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// ===== Three.js 初期化 =====
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  1000
);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "0";
document.body.appendChild(renderer.domElement);

camera.position.z = 200;

// 光
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 1);
scene.add(light);

// ===== 雲 =====
const clouds = [];
const cloudGeo = new THREE.SphereGeometry(20, 16, 16);
const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

function createClouds() {
  clouds.length = 0;
  for (let i = 0; i < 30; i++) {
    const cloud = new THREE.Mesh(cloudGeo, cloudMat);
    cloud.position.set(
      Math.random() * 400 - 200,
      Math.random() * 200 - 100,
      Math.random() * 200 - 100
    );
    cloud.scale.set(1.5, 1, 1);
    scene.add(cloud);
    clouds.push(cloud);
  }
}
createClouds();

// ===== 雨 =====
function createRain() {
  rain = [];
  for (let i = 0; i < 300; i++) {
    rain.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 4 + Math.random() * 4
    });
  }
}
createRain();

// ===== 描画ループ =====
function animate() {
  requestAnimationFrame(animate);

  // 雲
  clouds.forEach(c => {
    c.position.x += 0.05;
    if (c.position.x > 200) c.position.x = -200;
  });

  renderer.render(scene, camera);

  // 雨
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 1;

  rain.forEach(r => {
    ctx.beginPath();
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x + windX, r.y + 10);
    ctx.stroke();

    r.x += windX * 0.2;
    r.y += r.speed;

    if (r.y > canvas.height) {
      // 衝突エフェクト
      splashes.push({ x: r.x, y: canvas.height, life: 10 });

      r.y = 0;
      r.x = Math.random() * canvas.width;
    }
  });

  // 水しぶき
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  splashes.forEach((s, i) => {
    ctx.fillRect(s.x, s.y, 2, 2);
    s.y -= 2;
    s.life--;

    if (s.life <= 0) splashes.splice(i, 1);
  });
}
animate();

// ===== 時刻 =====
setInterval(() => {
  const el = document.getElementById("time");
  if (el) {
    el.textContent = new Date().toLocaleTimeString("ja-JP");
  }
}, 1000);

// ===== 天気取得 =====
function getLocationWeather() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(pos => {
    fetchWeather(pos.coords.latitude, pos.coords.longitude);
  });
}
window.getLocationWeather = getLocationWeather;

// ===== API =====
async function fetchWeather(lat, lon) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    const data = await res.json();

    const w = data.current_weather;

    // UI
    const tempEl = document.getElementById("temp");
    if (tempEl) tempEl.textContent = `${w.temperature}℃`;

    // 風（ここで代入）
    windX = w.windspeed / 2;

    // 風向きUI
    const arrow = document.getElementById("arrow");
    if (arrow) {
      arrow.style.transform = `rotate(${w.winddirection}deg)`;
    }

    const speed = document.getElementById("speed");
    if (speed) {
      speed.textContent = `${w.windspeed} km/h`;
    }

  } catch (e) {
    console.error("天気取得エラー", e);
  }
}
