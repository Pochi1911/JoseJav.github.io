async function getSummonerData() {
    const summonerName = document.getElementById('summonerName').value;
    const tagLine = document.getElementById('tagLine').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = 'Fetching data...';
  
    try {
      const puuidResponse = await fetch(`http://localhost:3000/puuid/${summonerName}/${tagLine}`);
      if (!puuidResponse.ok) {
        throw new Error(`Error fetching PUUID: ${puuidResponse.statusText}`);
      }
      const puuidData = await puuidResponse.json();
      const { puuid } = puuidData;
  
      const summonerResponse = await fetch(`http://localhost:3000/summoner/puuid/${puuid}`);
      if (!summonerResponse.ok) {
        throw new Error(`Error fetching summoner data: ${summonerResponse.statusText}`);
      }
      const summonerData = await summonerResponse.json();
  
      const summonerInfo = `
        <h2>Summoner ID: ${summonerData.summoner.id}</h2>
        <p>Level: ${summonerData.summoner.summonerLevel}</p>
        <p>Profile Icon ID: ${summonerData.summoner.profileIconId}</p>
      `;
  
      const leagueInfo = summonerData.league ? `
        <div>
          <h3>${summonerData.league.queueType}</h3>
          <p>Tier: ${summonerData.league.tier} ${summonerData.league.rank}</p>
          <p>League Points: ${summonerData.league.leaguePoints}</p>
          <p>Wins: ${summonerData.league.wins}</p>
          <p>Losses: ${summonerData.league.losses}</p>
        </div>
      ` : '<p>No league data found</p>';
  
      resultsDiv.innerHTML = `
        ${summonerInfo}
        <h2>League Data</h2>
        ${leagueInfo}
      `;
    } catch (error) {
      console.error(error);
      resultsDiv.innerHTML = `Error fetching data: ${error.message}`;
    }

  }
  document.addEventListener('DOMContentLoaded', async () => {
  const tableBody = document.getElementById('summonersTableBody');

  try {
    const response = await fetch('http://localhost:3000/summoners');
    if (!response.ok) {
      throw new Error('Error fetching summoner data');
    }

    const summoners = await response.json();
    let personas = summoners.summoners;
    personas = sortSummoners(personas);

    personas.forEach(summoner => {
      const row = document.createElement('tr');

      const nameCell = document.createElement('td');
      nameCell.textContent = summoner.name || 'N/A'; // Show 'N/A' if name is null
      row.appendChild(nameCell);

      const tierCell = document.createElement('td');
      tierCell.textContent = summoner.tier;
      row.appendChild(tierCell);

      const rankCell = document.createElement('td');
      rankCell.textContent = summoner.rank;
      row.appendChild(rankCell);

      const leaguePointsCell = document.createElement('td');
      leaguePointsCell.textContent = summoner.leaguePoints;
      row.appendChild(leaguePointsCell);

      const winsCell = document.createElement('td');
      winsCell.textContent = summoner.wins;
      row.appendChild(winsCell);

      const lossesCell = document.createElement('td');
      lossesCell.textContent = summoner.losses;
      row.appendChild(lossesCell);

      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error fetching summoner data:', error);
  }
});

  
  document.getElementById('getRankingsButton').addEventListener('click', getSummonerData);
  //////// Script para obtener los datos
  document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('summonersTableBody');
  
    try {
      const response = await fetch('http://localhost:3000/summoners');
      if (!response.ok) {
        throw new Error('Error fetching summoner data');
      }
  
      const summoners = await response.json();
  
      summoners.forEach(summoner => {
        const row = document.createElement('tr');
  
        const nameCell = document.createElement('td');
        nameCell.textContent = summoner.name || 'N/A'; // Show 'N/A' if name is null
        row.appendChild(nameCell);
  
        const tierCell = document.createElement('td');
        tierCell.textContent = summoner.tier;
        row.appendChild(tierCell);
  
        const rankCell = document.createElement('td');
        rankCell.textContent = summoner.rank;
        row.appendChild(rankCell);
  
        const leaguePointsCell = document.createElement('td');
        leaguePointsCell.textContent = summoner.leaguePoints;
        row.appendChild(leaguePointsCell);
  
        const winsCell = document.createElement('td');
        winsCell.textContent = summoner.wins;
        row.appendChild(winsCell);
  
        const lossesCell = document.createElement('td');
        lossesCell.textContent = summoner.losses;
        row.appendChild(lossesCell);
  
        tableBody.appendChild(row);
      });
    } catch (error) {
      console.error('Error fetching summoner data:', error);
    }
  }); 
  
  function sortSummoners(summoners) {
    const tierOrder = {
      'IRON': 0,
      'BRONZE': 1,
      'SILVER': 2,
      'GOLD': 3,
      'PLATINUM': 4,
      'EMERALD': 5,
      'DIAMOND': 6,
      'MASTER': 7,
      'GRANDMASTER': 8,
      'CHALLENGER': 9
    };
  
    const rankOrder = {
      'IV': 0,
      'III': 1,
      'II': 2,
      'I': 3
    };
  
    return summoners.sort((a, b) => {
      if (tierOrder[a.tier] !== tierOrder[b.tier]) {
        return tierOrder[b.tier] - tierOrder[a.tier];
      }
      if (rankOrder[a.rank] !== rankOrder[b.rank]) {
        return rankOrder[b.rank] - rankOrder[a.rank];
      }
      return b.leaguePoints - a.leaguePoints;
    });
  }
  
  
  