const dotenv = require("dotenv");
dotenv.config();

const validateEnv = require("./envValidator");

validateEnv();

module.exports = {
  port: process.env.PORT,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
};