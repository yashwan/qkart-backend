const express = require("express");
const compression = require("compression");
const cors = require("cors");
const httpStatus = require("http-status");
const routes = require("./routes/v1");
const { errorHandler } = require("./middlewares/error");
const ApiError = require("./utils/ApiError");
const helmet = require("helmet");
const passport = require("passport");
const { jwtStrategy } = require("./config/passport");

const app = express();

app.use(passport.initialize());
jwtStrategy(passport);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cors());
app.options("*", cors());


app.use("/v1", routes);

app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

app.use(errorHandler);

module.exports = app;
