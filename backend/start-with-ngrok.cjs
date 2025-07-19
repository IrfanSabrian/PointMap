// backend/start-with-ngrok.js
const { exec } = require("child_process");
const ngrok = require("ngrok");
const fs = require("fs");
const path = require("path");

// Jalankan backend (pastikan port sesuai server.js, misal 3001)
const backendProcess = exec("node server.js", { cwd: __dirname });

backendProcess.stdout.on("data", (data) => process.stdout.write(data));
backendProcess.stderr.on("data", (data) => process.stderr.write(data));

(async function () {
  // Tunggu beberapa detik agar backend siap
  await new Promise((res) => setTimeout(res, 3000));
  const url = await ngrok.connect(3001);
  console.log("Ngrok URL:", url);

  // Tulis URL ngrok ke file .env.local di frontend
  const envPath = path.resolve(__dirname, "../frontend/.env.local");
  fs.writeFileSync(envPath, `NEXT_PUBLIC_API_BASE_URL=${url}\n`);
  console.log("URL ngrok sudah ditulis ke frontend/.env.local");
})();
