
import express from "express";
import cors from "cors";

const app = express();

const PORT = Number(process.env.PORT || 3002);

// Konfiguracja NOAA API
const API_TOKEN = "ZRAeAatayTeRxaCjaVXWzxZHKWNFugUS";
const API_BASE = "https://www.ncei.noaa.gov/cdo-web/api/v2";

// Konfiguracja CORS
// "*" pozwala na zapytania z dowolnego frontendu
const FRONTEND_ORIGIN = "*";

app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ["GET", "OPTIONS"]
}));

// Funkcja pobierająca dane z NOAA
async function proxyFetch(endpoint, res) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        token: API_TOKEN
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `NOAA HTTP ${response.status}`
      });
    }

    const data = await response.json();

    return res.json(data);

  } catch (error) {
    console.error("Błąd komunikacji z NOAA:", error);

    return res.status(502).json({
      error: "Nie udało się pobrać danych NOAA"
    });
  }
}

// Endpointy proxy
app.get(["/stations", "/datasets", "/data"], (req, res) => {
  return proxyFetch(req.originalUrl, res);
});

// Healthcheck
app.get("/health", (req, res) => {
  return res.json({
    status: "ok",
    service: "NOAA Proxy"
  });
});

// Uruchomienie na Replit
app.listen(PORT, "0.0.0.0", () => {
  console.log(`NOAA Proxy działa na porcie ${PORT}`);
});
