const express = require('express');
const axios = require('axios');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const app = express();
const port = 3000;

const RIOT_API_KEY = 'RGAPI-32333443-3935-4d88-bfa2-be58a8aa2e1c';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let db;
(async () => {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
  await db.exec(`CREATE TABLE IF NOT EXISTS Summoners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255),
    tier VARCHAR(255) NOT NULL,
    rank VARCHAR(255) NOT NULL,
    leaguePoints INT NOT NULL,
    wins INTEGER NOT NULL,
    losses INTEGER NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
  )`);
})();

// Endpoint para obtener puuid usando gameName y tagLine
app.get('/puuid/:gameName/:tagLine', async (req, res) => {
  const { gameName, tagLine } = req.params;
  try {
    const puuidResponse = await axios.get(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${RIOT_API_KEY}`);
    const puuidData = puuidResponse.data;
    const { puuid } = puuidData;

    res.json(puuidData);
  } catch (error) {
    console.error('Error fetching puuid from Riot API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error fetching puuid from Riot API', details: error.response ? error.response.data : error.message });
  }
});

// Endpoint para obtener datos de invocador por puuid
app.get('/summoner/puuid/:puuid', async (req, res) => {
  const { puuid } = req.params;
  try {
    const summonerResponse = await axios.get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`);
    const summonerData = summonerResponse.data;
    const { id: encryptedSummonerId } = summonerData;

    // Obtener datos de clasificación usando encryptedSummonerId
    const leagueResponse = await axios.get(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptedSummonerId}?api_key=${RIOT_API_KEY}`);
    const leagueData = leagueResponse.data.find(entry => entry.queueType === "RANKED_SOLO_5x5");

    if (leagueData) {
      const { tier, rank, leaguePoints, wins, losses } = leagueData;

      // Guardar datos en la base de datos
      await db.run(`INSERT INTO Summoners (name, tier, rank, leaguePoints, wins, losses, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        null, tier, rank, leaguePoints, wins, losses);

      res.json({
        summoner: summonerData,
        league: leagueData
      });
    } else {
      res.status(404).json({ error: 'League data not found for summoner' });
    }
  } catch (error) {
    console.error('Error fetching data from Riot API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error fetching data from Riot API', details: error.response ? error.response.data : error.message });
  }
});

// Endpoint para obtener todos los summoners de la base de datos
app.get('/summoners', async (req, res) => {
  try {
    const summoners = await db.all('SELECT * FROM Summoners');
    res.json({ summoners });
  } catch (error) {
    console.error('Error fetching data from database:', error.message);
    res.status(500).json({ error: 'Error fetching data from database' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Endpoint para obtener los datos de los summoners de la base de datos
app.get('/summoners', async (req, res) => {
    try {
      const summoners = await db.all('SELECT name, tier, rank, leaguePoints, wins, losses FROM Summoners');
      res.json(summoners);
    } catch (error) {
      console.error('Error fetching data from database:', error.message);
      res.status(500).json({ error: 'Error fetching data from database' });
    }
  });
  