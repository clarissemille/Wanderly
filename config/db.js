const mongoose = require("mongoose");

mongoose
    .connect("mongodb+srv://" + process.env.DB_USER_PASS + "@cluster0.rmuijev.mongodb.net/wanderly",
        {
            useNewUrlParser: true, 
            useUnifiedTopology: true, 
        }
    )
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("Failed to connect to MongoDB", err))