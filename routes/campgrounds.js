const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const campground = require("../models/campground");
const { campgroundSchema } = require("../schemas");
const { isLoggedin, isAuthor, validateCampground } = require("../middleware");
const campgrounds = require("../controllers/campgrounds")

router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(isLoggedin, validateCampground, catchAsync(campgrounds.createCampground))

router.get("/new", isLoggedin, campgrounds.renderNewForm);

router.route("/:id")
    .get(catchAsync(campgrounds.showCampgrounds))
    .put(isLoggedin, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedin, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get("/:id/edit", isLoggedin, isAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router;