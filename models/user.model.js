const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isEmail } = require("validator")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    minLength: [3, 'Le nom doit faire 3 caractères minimum'], 
    maxLength: 55, 
    unique: true, 
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    validate: [isEmail], 
    unique: true,
    trim: true,

  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    max: 1024, 
    minlength: [6, 'Le mot de passe doit faire 6 caractères minimum'],
  },
  picture:{
    type: String,
    default: "./uploads/profil/random-user.png"
  },
  bio : {
      type: String,
      max: 1024
  },
  followers: {
      type: [String]
  }, 
  following: {
      type: [String]
  }, 
  posts: {
      type: [String]
  }, 
  }, {
    timestamps: true,
  });

// Hash du mot de passe avant de sauvegarder
userSchema.pre("save", async function(next){
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
})

userSchema.statics.login = async function(name, password){
  const user = await this.findOne({ name });
  if( user ) {
      const auth = await bcrypt.compare(password, user.password);
      if(auth) {
          return user;
      }
      throw Error("Incorrect password");
  }
  throw Error ("Incorrect name")
}
const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel