// ===== Three.js 雲 =====
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 200;

const clouds = [];
const cloudGeo = new THREE.SphereGeometry(20, 16, 16);
const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0,1,1);
scene.add(light);

// 雲生成
for (let i = 0; i < 30; i++) {
  const cloud = new THREE.Mesh(cloudGeo, cloudMat);
  cloud.position.set(
    Math.random()*400-200,
    Math.random()*200-100,
    Math.random()*200-100
  );
  cloud.scale.set(1.5,1,1);
  scene.add(cloud);
  clouds.push(cloud);
}

// ===== 雨Canvas =====
const canvas = document.getElementById("rainCanvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

let rain = [];
let splashes = [];
let windX = 0;

// 雨生成
for (let i = 0; i < 300; i++) {
  rain.push({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    speed: 4 + Math.random()*4
  });
}

// 描画ループ
function animate() {
  requestAnimationFrame(animate);

  // 雲動き
  clouds.forEach(c => {
    c.position.x += 0.05;
    if (c.position.x > 200) c.position.x = -200;
  });

  renderer.render(scene, camera);

  // 雨描画
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle = "white";
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
      r.x = Math.random()*canvas.width;
    }
  });

  // 水しぶき
  ctx.fillStyle = "white";
  splashes.forEach((s,i) => {
    ctx.fillRect(s.x, s.y, 2, 2);
    s.y -= 2;
    s.life--;

    if (s.life <= 0) splashes.splice(i,1);
  });
}

animate();

// ===== 時刻 =====
setInterval(()=>{
  document.getElementById("time").textContent =
    new Date().toLocaleTimeString("ja-JP");
},1000);

// ===== 天気API =====
function getLocationWeather() {
  navigator.geolocation.getCurrentPosition(pos=>{
    fetchWeather(pos.coords.latitude, pos.coords.longitude);
  });
}

async function fetchWeather(lat, lon) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
  );
  const data = await res.json();

  const w = data.current_weather;

  document.getElementById("temp").textContent = `${w.temperature}℃`;

  // 風
  windX = w.windspeed / 2;

  const dir = w.winddirection;
  document.getElementById("arrow").style.transform =
    `rotate(${dir}deg)`;

  document.getElementById("speed").textContent =
    `${w.windspeed} km/h`;
}
