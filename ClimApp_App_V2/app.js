window.onload = function () {
  setTimeout(() => {
    document.getElementById('splash-screen').style.display = 'none';
    document.getElementById('main-app').classList.remove('hidden');
  }, 2000);
};

const API_KEY = "ec8e50d80e385d71e212a6927563334f";

function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Por favor escribe una ciudad.");

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("weather-section").classList.remove("hidden");
      document.getElementById("weather-title").innerText = `${data.name}, ${data.sys.country}`;
      document.getElementById("temp").innerText = `${Math.round(data.main.temp)}°C`;
      document.getElementById("desc").innerText = data.weather[0].description;

      let icon = "☁️";
      if (data.weather[0].main === "Clear") icon = "☀️";
      if (data.weather[0].main === "Rain") icon = "🌧️";
      if (data.weather[0].main === "Snow") icon = "❄️";
      document.getElementById("weather-icon").innerText = icon;

      document.getElementById("details").innerHTML = `
        <p>🌧️ Precipitación: ${data.clouds.all}%</p>
        <p>💧 Humedad: ${data.main.humidity}%</p>
        <p>🌬️ Viento: ${data.wind.speed} km/h</p>
      `;

      const temp = data.main.temp;
      let suggestion = "";

      if (temp <= -10) suggestion = "Abrígate con muchas capas y usa una colcha si es posible.";
      else if (temp > -10 && temp <= 0) suggestion = "Ponte ropa muy abrigadora, guantes y gorro.";
      else if (temp > 0 && temp <= 10) suggestion = "Usa ropa abrigadora pero sin exagerar.";
      else if (temp > 10 && temp <= 18) suggestion = "Usa una chompa ligera o casaca fina.";
      else if (temp > 18 && temp <= 25) suggestion = "Hace calor, usa ropa ligera.";
      else suggestion = "Hace mucho calor, usa ropa muy ligera y protector solar.";

      document.getElementById("suggestion").innerText = suggestion;
    })
    .catch(() => alert("No se pudo obtener el clima. Revisa el nombre o tu conexión."));
}

function toggleGame() {
  const game = document.getElementById("game-container");
  game.classList.toggle("hidden");
  if (!game.classList.contains("hidden")) startGame();
}

function startGame() {
  let playerName = prompt("Tu nombre (máx 5 letras):");
  if (!playerName || playerName.length > 5) playerName = "Anon";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  let player = { x: 130, y: 370, w: 40, h: 20 };
  let drops = Array.from({ length: 5 }, () => ({
    x: Math.random() * 280,
    y: Math.random() * -400,
    speed: 2 + Math.random() * 2,
  }));

  let score = 0;
  let record = localStorage.getItem("record") || 0;
  updateScore();

  let left = false, right = false;

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") left = true;
    if (e.key === "ArrowRight") right = true;
  });

  document.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft") left = false;
    if (e.key === "ArrowRight") right = false;
  });

  window.moveLeft = function() {
    player.x -= 15;
    if (player.x < 0) player.x = 0;
  };

  window.moveRight = function() {
    player.x += 15;
    if (player.x > canvas.width - player.w) player.x = canvas.width - player.w;
  };

  function updateScore() {
    document.getElementById("gameScore").innerText = `${playerName} | Puntos: ${score} | Récord: ${record}`;
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (left) player.x -= 5;
    if (right) player.x += 5;
    player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

    ctx.fillStyle = "#5e503f";
    ctx.fillRect(player.x, player.y, player.w, player.h);

    ctx.fillStyle = "#4a4e69";
    drops.forEach(drop => {
      ctx.beginPath();
      ctx.arc(drop.x, drop.y, 5, 0, Math.PI * 2);
      ctx.fill();
      drop.y += drop.speed;

      if (drop.y > player.y && drop.x > player.x && drop.x < player.x + player.w) {
        alert("¡Te mojaste! Vuelve a empezar.");
        score = 0;
        drops.forEach(d => d.y = Math.random() * -400);
        updateScore();
      }

      if (drop.y > canvas.height) {
        drop.y = -20;
        drop.x = Math.random() * 280;
        score++;
        if (score > record) {
          record = score;
          localStorage.setItem("record", record);
        }
        updateScore();
      }
    });

    requestAnimationFrame(loop);
  }

  loop();
}
