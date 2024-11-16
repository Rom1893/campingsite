const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const campground = require("../models/campground");
const Review = require("../models/review");
const { reviewSchema } = require("../schemas");
const { validateReview, isLoggedin, isReviewAuthor } = require("../middleware");
const reviews = require("../controllers/reviews")



router.post("/", isLoggedin, validateReview, catchAsync(reviews.createReview))

router.delete("/:reviewId", isLoggedin, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;