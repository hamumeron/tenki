import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

// ===== 状態 =====
let windX = 0;
let weatherType = "clear";
let rain = [];
let splashes = [];

// ===== Canvas =====
const canvas = document.getElementById("rainCanvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
window.addEventListener("resize", resize);
resize();

// ===== Three.js =====
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 1, 1000);
camera.position.z = 200;

const renderer = new THREE.WebGLRenderer({ alpha:true });
renderer.setSize(innerWidth, innerHeight);
renderer.domElement.style.position = "fixed";
renderer.domElement.style.zIndex = "0";
document.body.appendChild(renderer.domElement);

// ===== 雲（粒子っぽくリアル化）=====
const cloudParticles = [];

const cloudTexture = new THREE.TextureLoader().load(
  "https://threejs.org/examples/textures/cloud.png"
);

const cloudMaterial = new THREE.MeshLambertMaterial({
  map: cloudTexture,
  transparent: true
});

const cloudGeo = new THREE.PlaneGeometry(300,300);

for(let i=0;i<25;i++){
  const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
  cloud.position.set(
    Math.random()*800-400,
    Math.random()*500-250,
    Math.random()*500-500
  );
  cloud.rotation.z = Math.random()*Math.PI;
  cloud.material.opacity = 0.5 + Math.random()*0.5;

  scene.add(cloud);
  cloudParticles.push(cloud);
}

const light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(0,0,1);
scene.add(light);

// ===== 雨 =====
function createRain(){
  rain=[];
  for(let i=0;i<400;i++){
    rain.push({
      x:Math.random()*canvas.width,
      y:Math.random()*canvas.height,
      speed:4+Math.random()*5
    });
  }
}
createRain();

// ===== 描画 =====
function animate(){
  requestAnimationFrame(animate);

  // 雲動き
  if(weatherType==="clear"||weatherType==="clouds"){
    cloudParticles.forEach(p=>{
      p.rotation.z += 0.0005;
      p.position.x += 0.2;
      if(p.position.x>400) p.position.x=-400;
    });
  }

  renderer.render(scene,camera);

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // 雨
  if(weatherType==="rain"||weatherType==="thunder"){
    ctx.strokeStyle="rgba(255,255,255,0.7)";
    rain.forEach(r=>{
      ctx.beginPath();
      ctx.moveTo(r.x,r.y);
      ctx.lineTo(r.x+windX,r.y+10);
      ctx.stroke();

      r.x+=windX*0.2;
      r.y+=r.speed;

      if(r.y>canvas.height){
        splashes.push({x:r.x,y:canvas.height,life:10});
        r.y=0;
        r.x=Math.random()*canvas.width;
      }
    });
  }

  // 水しぶき
  ctx.fillStyle="white";
  splashes.forEach((s,i)=>{
    ctx.fillRect(s.x,s.y,2,2);
    s.y-=2;
    s.life--;
    if(s.life<=0) splashes.splice(i,1);
  });
}
animate();

// ===== 時刻 =====
setInterval(()=>{
  document.getElementById("time").textContent =
    new Date().toLocaleTimeString("ja-JP");
},1000);

// ===== 天気テキスト =====
function getWeatherText(code){
  if(code===0) return "快晴";
  if(code<=3) return "晴れ";
  if(code<=48) return "曇り";
  if(code<=67) return "雨";
  return "雷雨";
}

// ===== 天気切替 =====
function setWeatherType(code){
  if(code===0) weatherType="clear";
  else if(code<=3) weatherType="clear";
  else if(code<=48) weatherType="clouds";
  else if(code<=67) weatherType="rain";
  else weatherType="thunder";
}

// ===== API =====
async function fetchWeather(lat,lon){
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
  );
  const data = await res.json();

  const w = data.current_weather;

  document.getElementById("temp").textContent = `${w.temperature}℃`;
  document.getElementById("weatherText").textContent =
    getWeatherText(w.weathercode);

  windX = w.windspeed/2;

  document.getElementById("arrow").style.transform =
    `rotate(${w.winddirection}deg)`;

  document.getElementById("speed").textContent =
    `${w.windspeed} km/h`;

  setWeatherType(w.weathercode);
}

// ===== 自動取得（ここ重要）=====
navigator.geolocation.getCurrentPosition(pos=>{
  fetchWeather(pos.coords.latitude,pos.coords.longitude);
});

// ===== テスト用（コンソール）=====
window.setWeather = (type)=>{
  console.log("テスト:",type);

  if(type==="晴れ") weatherType="clear";
  else if(type==="曇") weatherType="clouds";
  else if(type==="雨") weatherType="rain";
  else if(type==="雷雨") weatherType="thunder";
};
