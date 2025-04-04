require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const parlayRoutes = require("./routes/parlayRoutes");

require("./models/User");  //load models
require("./models/Parlay");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/parlays", parlayRoutes);

const PORT = process.env.port || 5001;
app.listen(PORT, () => console.log('Server running on port ${PORT}'));
//npx nodemon server.js test locally