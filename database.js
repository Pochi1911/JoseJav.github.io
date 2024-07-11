const Sequelize = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

const Summoner = sequelize.define('Summoner', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    tier: {
        type: Sequelize.STRING,
        allowNull: false
    },
    rank: {
        type: Sequelize.STRING,
        allowNull: false
    },
    leaguePoints: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    wins: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    losses: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

sequelize.sync()
    .then(() => {
        console.log('Database & tables created!');
    })
    .catch((error) => {
        console.error('Error creating database:', error);
    });

module.exports = Summoner;
