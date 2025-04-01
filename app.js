if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const compression = require("compression"); // 🆕 Gzip Compression
const nocache = require("nocache"); // 🆕 Disable browser caching for dynamic content

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression()); // 🆕 Compress response data for faster loads
app.use(nocache()); // 🆕 Prevent caching dynamic data

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"));
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1y" })); // 🆕 Cache static assets for a year

const dbUrl = process.env.ATLASDB_URL;
async function main() {
    try {
        await mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to DB");
    } catch (err) {
        console.error("Database connection error:", err);
    }
}

main();

// MongoDB Session Store
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: { secret: process.env.SECRET },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.error("ERROR in MONGO SESSION STORE:", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware for Flash Messages & Current User
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// 🆕 Preload some database queries to improve performance
app.use(async (req, res, next) => {
    if (!req.session.preloadedData) {
        try {
            const listings = await mongoose.model("Listing").find().limit(10); // Load some data beforehand
            req.session.preloadedData = listings;
        } catch (err) {
            console.error("Preloading data error:", err);
        }
    }
    next();
});

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// Redirect root URL (/) to /listings
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// 404 Error Handler
app.get("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// Global Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { err });
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
