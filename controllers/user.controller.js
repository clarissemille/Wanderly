const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
    const users = await UserModel.find().select("-password");
    res.status(200).json(users); 
}



module.exports.userInfo = async (req, res) => {
    console.log(req.params);
    
    if(!ObjectID.isValid(req.params.id)) {
        return res.status(400).send("ID unknown : " + req.params.id);
    }

    try {
        // Utilisation de await pour attendre la réponse de findById
        const user = await UserModel.findById(req.params.id).select("-password");
        
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).send("User not found");
        }
    } catch (err) {
        console.log("Error: " + err);
        res.status(500).send("Server error");
    }
};
// module.exports.userInfo = (req, res) =>{
//     console.log(req.params);
//     if(!ObjectID.isValid(req.params.id))
//         return res.status(400).send("ID unknown : " + req.params.id )
    
//     UserModel.findById(req.params.id, (err, docs) => {
//         if(!err) res.send(docs);
//         else console.log("ID unknown : " + err);
//     }).select("-password")
// }

module.exports.updateUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400).send("ID unknown : " + req.params.id);
    }

    try {
        // Utilisation d'await pour effectuer l'opération de mise à jour
        const updatedUser = await UserModel.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { bio: req.body.bio } },
            { new: true, setDefaultsOnInsert: true } // Correction: supprimez "upset"
        );

        if (!updatedUser) {
            return res.status(404).send("User not found");
        }

        // Réponse avec l'utilisateur mis à jour
        res.status(200).json(updatedUser);
    } catch (err) {
        // Gestion des erreurs avec un message d'erreur approprié
        console.error("Error: ", err);
        res.status(500).json({ message: err.message });
    }
};


module.exports.deleteUser = async (req, res) => {
    // Vérification si l'ID est valide
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400).send("ID unknown : " + req.params.id);
    }

    try {
        // Utilisation de findByIdAndDelete pour supprimer l'utilisateur
        const deletedUser = await UserModel.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            // Si aucun utilisateur n'est trouvé, retour d'une erreur 404
            return res.status(404).json({ message: "User not found" });
        }

        // Réponse après suppression réussie
        res.status(200).json({ message: "Successfully deleted." });
    } catch (err) {
        // Gestion des erreurs
        console.error("Error: ", err);
        res.status(500).json({ message: err.message });
    }
};

module.exports.follow = async (req, res) => {
    if (!ObjectID.isValid(req.params.id) || !ObjectID.isValid(req.body.idToFollow)) {
        return res.status(400).send("ID unknown : " + req.params.id);
    }

    try {
        // Ajout à la liste des abonnements (follow)
        const user = await UserModel.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { following: req.body.idToFollow } },
            { new: true, upsert: true } // `upsert: true` permet de créer un document si l'utilisateur n'existe pas
        );

        if (!user) {
            return res.status(404).json({ message: "User not found for following" });
        }

        // Ajout à la liste des abonnés (followers)
        const followedUser = await UserModel.findByIdAndUpdate(
            req.body.idToFollow,
            { $addToSet: { followers: req.params.id } },
            { new: true, upsert: true }
        );

        if (!followedUser) {
            return res.status(404).json({ message: "User to follow not found" });
        }

        // Répondre une fois après les deux mises à jour
        res.status(201).json({ message: "Successfully followed the user" });

    } catch (err) {
        // Gestion des erreurs
        console.error("Error: ", err);
        res.status(500).json({ message: err.message });
    }
};

module.exports.unfollow = async (req, res) => {
    if (!ObjectID.isValid(req.params.id) || !ObjectID.isValid(req.body.idToUnfollow)) {
        return res.status(400).send("ID unknown : " + req.params.id);
    }

    try {
        // Retirer de la liste "following" de l'utilisateur
        const user = await UserModel.findByIdAndUpdate(
            req.params.id,
            { $pull: { following: req.body.idToUnfollow } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found for unfollow" });
        }

        // Retirer de la liste "followers" de l'utilisateur suivi
        const followedUser = await UserModel.findByIdAndUpdate(
            req.body.idToUnfollow,
            { $pull: { followers: req.params.id } },
            { new: true }
        );

        if (!followedUser) {
            return res.status(404).json({ message: "User to unfollow not found" });
        }

        // Répondre une seule fois après les deux mises à jour
        res.status(200).json({ message: "Successfully unfollowed the user" });

    } catch (err) {
        // Gestion des erreurs
        console.error("Error: ", err);
        res.status(500).json({ message: err.message });
    }
};