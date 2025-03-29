const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const validateListing = require("../middleware.js").validateListing;
const { isLoggedIn } = require("../middleware.js");
const { isOwner } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const { upload } = require("../cloudConfig.js"); // Use the upload middleware directly

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("image"),
        validateListing,
        wrapAsync(listingController.createListing)
    );

router.get("/new", isLoggedIn, listingController.renderNewForm);

router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single("image"),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;