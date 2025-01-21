const UserModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const { signInErrors, signUpErrors } = require("../utils/errors.utils")

const maxAge = 3 * 24 * 60 * 60 * 1000
const createToken = (id) => {
    return jwt.sign({id}, process.env.TOKEN_SECRET, {
        expiresIn: maxAge
    })
}


module.exports.signUp = async(req, res) => {    
    const{name, email, password} = req.body 

    try{
        const user = await UserModel.create({name, email, password}); 
        res.status(201).json({ user: user._id})
    }
    catch(err){
        const errors = signUpErrors(err);
        res.status(200).send({ errors })
    }
}

module.exports.signIn = async (req, res) => {
    const { name, password } = req.body

    try {
        const user = await UserModel.login(name, password); 
        const token = createToken(user._id )        
        console.log('Utilisateur connecté :', user);
        res.cookie("jwt", token, { httpOnly: true, maxAge });
        res.status(200).json({user: user._id})
    } catch (err){
        console.error('Erreur lors de la connexion :', err);
        const errors = signInErrors(err)
        console.log("Erreurs transformées :", err); // Log des erreurs formatées

        res.status(200).json({ err });

    }
}

module.exports.logout = (req, res) => {
    res.cookie("jwt", '', {maxAge: 1});
    res.redirect("/")
}