const API_KEY = "23bf01617f919e68753ccaac1b9db719";

async function getWeather() {
  const city = document.getElementById("city").value;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=ja`;

  const res = await fetch(url);
  const data = await res.json();

  document.getElementById("result").innerHTML = `
    <h2>${data.name}</h2>
    <p>気温: ${data.main.temp}℃</p>
    <p>天気: ${data.weather[0].description}</p>
  `;
}
