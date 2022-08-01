const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const campground = require("../models/campground");
const { campgroundSchema } = require("../schemas");
const { isLoggedin, isAuthor, validateCampground } = require("../middleware");



router.get("/", async (req, res) => {
    const campgrounds = await campground.find({});
    res.render("campgrounds/index", { campgrounds })
});

router.get("/new", isLoggedin, (req, res) => {
    res.render("campgrounds/new")
});

router.post("/", isLoggedin, validateCampground, catchAsync(async (req, res, next) => {
    const Newcampground = new campground(req.body.campground);
    Newcampground.author = req.user._id;
    await Newcampground.save();
    req.flash("success", "Successfully made a new campground")
    res.redirect(`/campgrounds/${Newcampground._id}`)
}));

router.get("/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    const Onecampground = await campground.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate("author");
    console.log(Onecampground)
    if (!Onecampground) {
        req.flash("error", "Campground not found :(");
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", { Onecampground });
}));

router.get("/:id/edit", isLoggedin, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const Onecampground = await campground.findById(id);
    if (!Onecampground) {
        req.flash("error", "Campground not found :(");
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", { Onecampground });
}));

router.put("/:id", isLoggedin, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash("success", "Succesfully updated campground!")
    res.redirect(`/campgrounds/${camp._id}`)
}));

router.delete("/:id", isLoggedin, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await campground.findByIdAndDelete(id);
    req.flash("success", "Deleted your campground!")
    res.redirect("/campgrounds");
}));

module.exports = router;