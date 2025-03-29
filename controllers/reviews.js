const mongoose = require("mongoose");
const Review=require("../models/review");
const Listing=require("../models/listing");


module.exports.createReview=async (req, res) => {
  
    let listing = await Listing.findById(req.params.id);
    
    if (!listing) {
        throw new ExpressError(404, "Listing not found!");
    }

    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);

    newReview.author = req.user._id;

    await newReview.save();
    await listing.save();

   req.flash("success", "New Review Added Successfully!");
    res.redirect(`/listings/${listing._id}`);
};



module.exports.destroyReview=async (req, res) => {
    let { id, reviewId } = req.params;

    let listing = await Listing.findById(id);
    let review = await Review.findById(reviewId);

    if (!listing || !review) {
        req.flash("error", "Listing or Review not found!");
        return res.redirect(`/listings/${id}`);
    }

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted successfully!");
    res.redirect(`/listings/${id}`);
};