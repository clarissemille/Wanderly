const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isEmail } = require("validator")

const userSchema = new mongoose.Schema({
  username: {
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
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
