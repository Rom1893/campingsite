const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const campground = require("../models/campground");
const Review = require("../models/review");
const { reviewSchema } = require("../schemas");
const { validateReview, isLoggedin, isReviewAuthor } = require("../middleware");



router.post("/", isLoggedin, validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const Onecampground = await campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    Onecampground.reviews.push(review);
    await review.save();
    await Onecampground.save();
    req.flash("success", "Successfully added a new review!")
    res.redirect(`/campgrounds/${id}`)
}))

router.delete("/:reviewId", isLoggedin, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Deleted your review!")
    res.redirect(`/campgrounds/${id}`)

}));

module.exports = router;