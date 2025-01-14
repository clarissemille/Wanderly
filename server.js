const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: './config/.env' });


// Charger les variables d'environnement
dotenv.config();

const app = express();

// Middleware pour analyser les données JSON
app.use(express.json());

// Configuration de la route par défaut
app.get('/', (req, res) => {
  res.send('API Wanderly est en ligne !');
});


//server 
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
