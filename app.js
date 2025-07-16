const express = require('express');
const app = express();

const morgan = require('morgan');

const authRouter = require("./src/routes/auth.routes");
const usersRouter = require("./src/routes/users.routes");
const interactionsRouter = require("./src/routes/interactions.routes");

app.use(morgan('dev'));
app.use(express.json());

app.use("/api", authRouter);
app.use("/api", usersRouter);
app.use("/api", interactionsRouter);

module.exports = app;