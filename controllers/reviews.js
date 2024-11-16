const Review = require("../models/review");
const campground = require("../models/campground");

module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const Onecampground = await campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    Onecampground.reviews.push(review);
    await review.save();
    await Onecampground.save();
    req.flash("success", "Successfully added a new review!")
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Deleted your review!")
    res.redirect(`/campgrounds/${id}`)

}