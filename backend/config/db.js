const mongoose = require("mongoose");

mongoose
    .connect("mongodb+srv://" + process.env.DB_USER_PASS + "@wanderly.njyzu2i.mongodb.net/",
        {
            useNewUrlParser: true, 
            useUnifiedTopology: true, 
        }
    )
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("Failed to connect to MongoDB", err))