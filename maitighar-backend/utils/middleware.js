const logger = require("./logger");
const mongoose = require("mongoose");
const User = require("../models/user");
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");

const requestLogger = (request, response, next) => {
  logger.info("Method:", request.method);
  logger.info("Path:", request.path);
  logger.info("Body:", request.body);
  logger.info("---");
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown request" });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);
  if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).send({ error: error.message });
  } else if (error.name === "TokenExpiredError") {
    return response.status(401).send({ error: error.message });
  }
  next(error);
};

const tokenExtractor = (request, response, next) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    request.token = authorization.replace("Bearer ", "");
  } else {
    request.token = null;
  }
  next();
};

const userExtractor = async (request, response, next) => {
  const authHeader = request.headers.authorization;
  console.log("header", authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(401).json({ error: "token missing" });
  }
  const token = authHeader.split(" ")[1];
  request.token = token;
  try {
    // Verify the token
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!decodedToken.id || !mongoose.isValidObjectId(decodedToken.id)) {
      return response.status(401).json({ error: "invalid or malformed token" });
    }

    const user = await User.findById(decodedToken.id);
    const admin = await Admin.findById(decodedToken.id);
    if (user) {
      request.user = user;
      request.userType = "user";
    } else if (admin) {
      request.user = admin;
      request.userType = "admin";
    } else {
      return response.status(404).json({ error: "User/Admin not found" });
    }
    next(); // Call the next middleware
  } catch (error) {
    return response.status(401).json({ error: "token verification failed" });
  }
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
};
