const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const campground = require("../models/campground");
const { campgroundSchema } = require("../schemas");
const { isLoggedin } = require("../middleware");


const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }

};

router.get("/", async (req, res) => {
    const campgrounds = await campground.find({});
    res.render("campgrounds/index", { campgrounds })
});

router.get("/new", isLoggedin, (req, res) => {
    res.render("campgrounds/new")
});

router.post("/", isLoggedin, validateCampground, catchAsync(async (req, res, next) => {
    const Newcampground = new campground(req.body.campground);
    await Newcampground.save();
    req.flash("success", "Successfully made a new campground")
    res.redirect(`/campgrounds/${Newcampground._id}`)
}));

router.get("/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    const Onecampground = await campground.findById(id).populate("reviews");
    if (!Onecampground) {
        req.flash("error", "Campground not found :(");
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", { Onecampground });
}));

router.get("/:id/edit", isLoggedin, catchAsync(async (req, res) => {
    const { id } = req.params;
    const Onecampground = await campground.findById(id);
    if (!Onecampground) {
        req.flash("error", "Campground not found :(");
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", { Onecampground });
}));

router.put("/:id", isLoggedin, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campgroundEdit = await campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash("success", "Succesfully updated campground!")
    res.redirect(`/campgrounds/${campgroundEdit._id}`)
}));

router.delete("/:id", isLoggedin, catchAsync(async (req, res) => {
    const { id } = req.params;
    await campground.findByIdAndDelete(id);
    req.flash("success", "Deleted your campground!")
    res.redirect("/campgrounds");
}));

module.exports = router;