# Utilise une image Node officielle
FROM node:25

# Définition du dossier de travail
WORKDIR /app

# Copie des fichiers package.json et installation des dépendances
COPY package*.json ./
RUN npm install

# Copie du reste des fichiers
COPY . .

# Expose le port du backend
EXPOSE 5000

# Commande de lancement
CMD ["npm", "run", "dev"]




