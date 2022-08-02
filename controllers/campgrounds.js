const campground = require("../models/campground");

module.exports.index = async (req, res) => {
    const campgrounds = await campground.find({});
    res.render("campgrounds/index", { campgrounds })
};

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new")
};

module.exports.createCampground = async (req, res, next) => {
    const Newcampground = new campground(req.body.campground);
    Newcampground.author = req.user._id;
    await Newcampground.save();
    req.flash("success", "Successfully made a new campground")
    res.redirect(`/campgrounds/${Newcampground._id}`)
};


module.exports.showCampgrounds = async (req, res) => {
    const { id } = req.params;
    const Onecampground = await campground.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate("author");
    if (!Onecampground) {
        req.flash("error", "Campground not found :(");
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", { Onecampground });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const Onecampground = await campground.findById(id);
    if (!Onecampground) {
        req.flash("error", "Campground not found :(");
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", { Onecampground });
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const camp = await campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash("success", "Succesfully updated campground!")
    res.redirect(`/campgrounds/${camp._id}`)
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await campground.findByIdAndDelete(id);
    req.flash("success", "Deleted your campground!")
    res.redirect("/campgrounds");
};