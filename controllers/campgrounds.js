const campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxGeocoding({accessToken: mapBoxToken})

module.exports.index = async (req, res) => {
    const campgrounds = await campground.find({});
    res.render("campgrounds/index", { campgrounds })
};

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new")
};

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const Newcampground = new campground(req.body.campground);
    Newcampground.geometry = geoData.body.features[0].geometry;
    Newcampground.image = req.files.map(f => ({ url: f.path, filename: f.filename }))
    Newcampground.author = req.user._id;
    await Newcampground.save();
    console.log(Newcampground);
    req.flash("success", "Successfully made a new campground");
    res.redirect(`/campgrounds/${Newcampground._id}`);
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
    console.log(req.body);
    const camp = await campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    camp.image.push(...imgs);
    await camp.save();
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } })
        console.log(camp)
    };
    req.flash("success", "Succesfully updated campground!")
    res.redirect(`/campgrounds/${camp._id}`)
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await campground.findByIdAndDelete(id);
    req.flash("success", "Deleted your campground!")
    res.redirect("/campgrounds");
};