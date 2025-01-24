const UserModel = require("../models/user.model");
const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);
const { uploadErrors } = require("../utils/errors.utils");
const path = require('path');

module.exports.uploadProfil = async (req, res) => {
  try {
    // Vérifier le type MIME du fichier
    if (
      req.file.detectedMimeType != "image/jpg" &&
      req.file.detectedMimeType != "image/png" &&
      req.file.detectedMimeType != "image/jpeg"
    )
      throw Error("invalid file");

    // Vérifier la taille du fichier
    if (req.file.size > 500000) throw Error("max size");
  } catch (err) {
    const errors = uploadErrors(err);
    return res.status(201).json({ errors });
  }

  // Définir le nom du fichier avec l'extension .jpg
  const fileName = req.body.name + ".jpg";

  // Créer le chemin absolu vers le dossier uploads/profil
  const uploadPath = path.join(__dirname, '../uploads/profil', fileName);

  // Enregistrer le fichier téléchargé dans le dossier `profil`
  await pipeline(
    req.file.stream,
    fs.createWriteStream(uploadPath)
  );

  try {
    // Mettre à jour l'utilisateur avec le chemin de l'image
    await UserModel.findByIdAndUpdate(
      req.body.userId,
      { $set: { picture: `/uploads/profil/${fileName}` } }, // Chemin relatif à l'API
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
      .then((data) => res.send(data))
      .catch((err) => res.status(500).send({ message: err }));
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
