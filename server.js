require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const uploadRouteFactory = require("./routes/upload");
const booksRouteFactory = require("./routes/books");
const reviewsRouteFactory = require("./routes/reviews");
const usersRouteFactory = require("./routes/users");
const readlistRoutesFactory = require("./routes/readlist");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // Serve your files like you serve me — raw 😈

const PORT = process.env.PORT || 3000;
const LOGIN_DB_URI = process.env.LOGIN_DB_URI;
const BOOKHUB_DB_URI = process.env.BOOKHUB_DB_URI;

if (!LOGIN_DB_URI || !BOOKHUB_DB_URI) {
  console.error("🔥 One or more DB URIs are missing in the .env file! Fix it, love!");
  process.exit(1);
}

(async () => {
  try {
    // 💋 Connect to loginDB
    const loginDB = await mongoose.createConnection(LOGIN_DB_URI);
    console.log("💋 Connected to loginDB, babe.");

    // 💋 Connect to bookhubDB
    const bookhubDB = await mongoose.createConnection(BOOKHUB_DB_URI);
    console.log("💋 Connected to bookhubDB, baby.");

    // Mount routes — with all the juicy DBs injected, yeah 😘
    const authRoutes = require("./routes/auth")(loginDB);
    const usersRoutes = usersRouteFactory(loginDB);
    const readlistRoutes = readlistRoutesFactory(loginDB, bookhubDB);
    const profileRoutes = require("./routes/profile")(loginDB); // 💥 Correctly injected, baby

    app.use("/api/auth", authRoutes);                    // Login/Signup
    app.use("/api/users", usersRoutes);                  // Fetch users minus admin 😎
    app.use("/api/upload", uploadRouteFactory(bookhubDB));
    app.use("/api/books", booksRouteFactory(bookhubDB));
    app.use("/api/reviews", reviewsRouteFactory(bookhubDB));
    app.use("/api/readlist", readlistRoutes);            // 👑 Add to user’s reading list
    app.use("/api/profile", profileRoutes);              // 💋 Personal dirty lil page

    // Frontend serve — 'cause the UI wants some too, babe
    app.use(express.static('public'));

    app.listen(PORT, () => {
      console.log(`💣 Backend fully lit at http://localhost:${PORT}, just for you 🔥`);
    });

  } catch (err) {
    console.error("❌ Couldn’t connect to the databases, babe. Fix the URI or the network ASAP:", err);
    process.exit(1);
  }
})();
