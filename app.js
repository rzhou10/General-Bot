import express from "express";
import path from "path";
import { createServer } from 'http';
import routes from "./routes/lastfm.routes.js";
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Initialize express
const app = express();

// Set cors variables
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Request-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// add the route
routes(app, express);

// Set __dirname for directories
const dirname1 = dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(dirname1, "../../")));
app.use(express.static(path.join(dirname1, "./")));

// Server Initialization
createServer(app).listen("3000", '0.0.0.0',
  (error) => {
    if (!error) {
      console.log("App is listening on port 3000");
    }
    else {
      console.log("Server failed ", error);
    }
  }
);