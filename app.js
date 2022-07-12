const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const ejsmate = require("ejs-mate");
const campground = require("./models/campground");
const methodOverride = require("method-override");
const { error } = require("console");
const { campgroundSchema, reviewSchema } = require("./schemas");
const Review = require("./models/review")

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected")
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsmate);

app.listen(3000, () => {
    console.log("Listening on port 3000")
});
/////////////////////////////////////////////////////////
//////////////////////STARTS HERE////////////////////////
/////////////////////////////////////////////////////////
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

const validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}

app.get("/", (req, res) => {
    res.render("home")
});

app.get("/campgrounds", async (req, res) => {
    const campgrounds = await campground.find({});
    res.render("campgrounds/index", { campgrounds })
});

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new")
});

app.post("/campgrounds", validateCampground, catchAsync(async (req, res, next) => {
    const Newcampground = new campground(req.body.campground);
    await Newcampground.save();
    res.redirect(`/campgrounds/${Newcampground._id}`)
}));

app.get("/campgrounds/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    const Onecampground = await campground.findById(id).populate("reviews");
    res.render("campgrounds/show", { Onecampground });
}));

app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
    const { id } = req.params;
    const Onecampground = await campground.findById(id);
    res.render("campgrounds/edit", { Onecampground });
}));

app.put("/campgrounds/:id", validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campgroundEdit = await campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campgroundEdit._id}`)
}));

app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    await campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
}));

app.post("/campgrounds/:id/reviews", validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const Onecampground = await campground.findById(id);
    const review = new Review(req.body.review);
    Onecampground.reviews.push(review);
    await review.save();
    await Onecampground.save();
    res.redirect(`/campgrounds/${id}`)
}))

app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`)

}));

app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found", 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh no something went wrong :("
    res.status(statusCode).render("error", { err })
});
