const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: './config/.env' });
require('./config/db');
const app = express();


//server 
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
