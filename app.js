const express = require('express');
const app = express();

const morgan = require('morgan');
const helmet = require('helmet');
const sanitizeInputs = require("./src/middlewares/sanitizeHTML.middleware")

const authRouter = require("./src/routes/auth.routes");
const usersRouter = require("./src/routes/users.routes");
const interactionsRouter = require("./src/routes/interactions.routes");

app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInputs);

app.use("/api", authRouter);
app.use("/api", usersRouter);
app.use("/api", interactionsRouter);

module.exports = app;