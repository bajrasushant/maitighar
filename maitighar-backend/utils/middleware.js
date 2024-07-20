const logger = require("./logger");
const User = require("../models/user");
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
	console.log(authorization);
  if (authorization && authorization.startsWith("Bearer ")) {
    request.token = authorization.replace("Bearer ", "");
  } else {
    request.token = null;
  }
  next();
};

const userExtractor = async (request, response, next) => {
	if(!request.token){
    return response.status(401).json({ error: "token missing" });
	}
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "invalid token" });
  }
  const user = await User.findById(decodedToken.id);
  request.user = user;
  next();
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
};
