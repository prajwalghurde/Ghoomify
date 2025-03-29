const mongoose = require("mongoose");
const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    const { category, search } = req.query; // Get both category and search from query parameters
    let query = {};

    // Handle category filter
    if (category && category !== "trending") {
        query.category = category;
    }

    // Handle search filter
    if (search) {
        const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
        query.$or = [
            { location: searchRegex },
            { country: searchRegex }
        ];
    }

    const allListings = await Listing.find(query);
    res.render("listings/index.ejs", { allListings, search: search || '' }); // Pass search term to template
};
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid ID");
    }

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    
    if (!listing) {
        req.flash("error", "Listing not found!");
        res.redirect("/listings");
    }
    console.log(listing);

    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    try {
        console.log("req.file:", req.file);
        console.log("req.body:", req.body);

        if (!req.file) {
            req.flash("error", "Image upload is required!");
            return res.redirect("/listings/new");
        }

        const newListing = new Listing(req.body.listing);
        const url = req.file.path;
        const filename = req.file.filename;
        newListing.image = { url, filename };

        newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success", "New Listing Created Successfully!");
        res.redirect("/listings");
    } catch (err) {
        req.flash("error", err.message || "Failed to create listing. Please try again.");
        res.redirect("/listings/new");
    }
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing doesn't exist!");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    try {
        let { id } = req.params;
        let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

        if (req.file) {
            const url = req.file.path;
            const filename = req.file.filename;
            listing.image = { url, filename };
            await listing.save();
        }

        req.flash("success", "Listing Updated Successfully!");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        req.flash("error", err.message || "Failed to update listing. Please try again.");
        res.redirect(`/listings/${id}/edit`);
    }
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted Successfully!");
    res.redirect("/listings");
};