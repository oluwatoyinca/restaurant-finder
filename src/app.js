const express = require("express");
const app = express();
const restRouter = require('./routers/restaurant');

app.use(express.json());
app.use(restRouter.router);

// app.get("/", (request, response) => {
//   res.sendStatus(404);
// });

module.exports = app; 