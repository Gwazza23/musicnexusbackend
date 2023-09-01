require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const cors = require("cors");
const app = express();

const url =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "https://musicnexus.vercel.app";

const PORT = process.env.PORT || 3000;

const spotifyRouter = require("./routes/spotify");

app.use(express.json());
app.use(
  cors({
    origin: url,
    credentials: true,
  })
);

app.set("trust proxy", 1);

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "sessions",
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60,
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
      secure: process.env.NODE_ENV === "development" ? false : true,
    },
  })
);

app.use("/spotify", spotifyRouter);

app.listen(PORT, () => {
  console.log(`Listening to PORT ${PORT}`);
});
