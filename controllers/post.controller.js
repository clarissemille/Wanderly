const postModel = require("../models/post.model");
const PostModel = require("../models/post.model");
const UserModel = require("../models/user.model");
const { uploadErrors } = require("../utils/errors.utils");
const ObjectID = require("mongoose").Types.ObjectId;
const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);
const path = require('path');



module.exports.readPost = (req, res) => {
    PostModel.find().sort({ createdAt: -1 })
        .then((posts) => {
            res.status(200).json(posts);
        })
        .catch((err) => {
            console.log("Error to get data: ", err);
            res.status(500).send("Failed to fetch posts");
        });
};


// module.exports.readPost = (req, res) => {
//   PostModel.find((err, docs) => {
//     if (!err) res.send(docs);
//     else console.log("Error to get data : " + err);
//   }).sort({ createdAt: -1 });
// };

module.exports.createPost = async (req, res) => {
  let fileName;

  // Vérifier si un fichier est bien fourni
  if (req.file) {
    try {
      // Vérification du type de fichier
      if (
        req.file.detectedMimeType != "image/jpg" &&
        req.file.detectedMimeType != "image/png" &&
        req.file.detectedMimeType != "image/jpeg"
      )
        throw new Error("Invalid file format. Only JPG, PNG, and JPEG are allowed.");
      
      // Vérification de la taille du fichier
      if (req.file.size > 500000) throw new Error("File size exceeds the limit of 500 KB.");

    } catch (err) {
      // Gestion des erreurs de type et de taille de fichier
      const errors = uploadErrors(err);
      return res.status(400).json({ errors }); // Changer le code HTTP à 400 pour indiquer une mauvaise requête
    }

    // Création du nom de fichier unique
    fileName = req.body.posterId + Date.now() + ".jpg";

    // Définir le chemin absolu du fichier dans le dossier uploads/posts
    const uploadPath = path.join(__dirname, '../uploads/posts', fileName);
    
    // Vérifier si le répertoire `uploads/posts` existe, sinon le créer
    const postsDir = path.join(__dirname, '../uploads/posts');
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }

    try {
      // Sauvegarder le fichier dans le répertoire uploads/posts
      await pipeline(
        req.file.stream,
        fs.createWriteStream(uploadPath)
      );
    } catch (err) {
      return res.status(500).send({ message: 'Error saving file', error: err });
    }
  }

  // Créer un nouveau post avec les données envoyées
  const newPost = new postModel({
    posterId: req.body.posterId,
    location: req.body.location,
    description: req.body.description,
    picture: req.file !== null ? "./uploads/posts/" + fileName : "", // Si pas d'image, le champ restera vide
    video: req.body.video,
    likers: [],
    comments: [],
  });

  try {
    // Enregistrer le post dans la base de données
    const post = await newPost.save();
    return res.status(201).json(post);
  } catch (err) {
    // Gérer les erreurs lors de la sauvegarde du post
    return res.status(400).send({ message: 'Error saving post', error: err });
  }
};

module.exports.updatePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  const updatedRecord = {
    message: req.body.message,
  };

  try {
    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      { $set: updatedRecord },
      { new: true } // Retourne le document mis à jour
    );
    if (!updatedPost) {
      return res.status(404).send("Post not found");
    }
    return res.status(200).json(updatedPost);
  } catch (err) {
    console.log("Update error : ", err);
    return res.status(500).send("Error updating post");
  }
};


module.exports.deletePost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  // Remplacer findByIdAndRemove par findByIdAndDelete
  PostModel.findByIdAndDelete(req.params.id)  // Utilisation de findByIdAndDelete
    .then((docs) => {
      if (docs) {
        res.status(200).send(docs);
      } else {
        res.status(404).send("Post not found");
      }
    })
    .catch((err) => {
      console.log("Delete error: " + err);
      res.status(500).send("Error deleting the post");
    });
};


module.exports.likePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    const post = await PostModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likers: req.body.id } },
      { new: true }
    );

    const user = await UserModel.findByIdAndUpdate(
      req.body.id,
      { $addToSet: { likes: req.params.id } },
      { new: true }
    );

    res.send({ post, user }); // Une seule réponse regroupant les résultats
  } catch (err) {
    res.status(400).send(err);
  }
};


module.exports.unlikePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    const post = await PostModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { likers: req.body.id } },
      { new: true }
    );

    const user = await UserModel.findByIdAndUpdate(
      req.body.id,
      { $pull: { likes: req.params.id } },
      { new: true }
    );

    res.send({ post, user }); // Une seule réponse regroupant les résultats
  } catch (err) {
    res.status(400).send(err);
  }
};


module.exports.commentPost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    return PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            commenterId: req.body.commenterId,
            commenterPseudo: req.body.commenterPseudo,
            text: req.body.text,
            timestamp: new Date().getTime(),
          },
        },
      },
      { new: true })
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));
    } catch (err) {
        return res.status(400).send(err);
    }
};

module.exports.editCommentPost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send("Post ID unknown: " + req.params.id);
  }

  try {
    // Find the post by ID and check if the comment exists
    const post = await PostModel.findById(req.params.id);
    
    if (!post) {
      return res.status(404).send("Post not found");
    }

    // Find the comment in the post's comments array
    const comment = post.comments.id(req.body.commentId); // Use `id()` to get the comment by ID
    
    if (!comment) {
      return res.status(404).send("Comment not found");
    }

    // Update the comment's text
    comment.text = req.body.text;

    // Save the post with the updated comment
    const updatedPost = await post.save();

    return res.status(200).json(updatedPost); // Return the updated post
  } catch (err) {
    console.error("Error editing comment:", err);
    return res.status(500).send("Error editing comment");
  }
};


module.exports.deleteCommentPost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    return PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          comments: {
            _id: req.body.commentId,
          },
        },
      },
      { new: true })
            .then((data) => res.send(data))
            .catch((err) => res.status(500).send({ message: err }));
    } catch (err) {
        return res.status(400).send(err);
    }
};
