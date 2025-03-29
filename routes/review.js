const mongoose = require("mongoose");
const express=require("express");
const router=express.Router({mergeParams:true});
const Review = require("../models/review.js");

const wrapAsync = require("../utils/wrapAsync.js");
const {reviewSchema}=require("../schema.js");
const ExpressError=require("../utils/ExpressError.js");
const Listing = require("../models/listing");
const { isLoggedIn,isReviewAuthor } = require("../middleware.js");

const validateReview=require("../middleware.js").validateReview;
const reviewController=require("../controllers/reviews.js");


//post route
router.post("/", isLoggedIn ,validateReview, wrapAsync(reviewController.createReview));




//Delete review Route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));


module.exports=router;