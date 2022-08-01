const mongoose = require("mongoose");
const campground = require("../models/campground")
const cities = require("./cities")
const { places, descriptors } = require("./seedHelpers")

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected")
})

const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new campground({
            author: "62e1ba3eeffa0e242e974e21",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: "https://source.unsplash.com/collection/483251/1600x900",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, adipisci debitis! Ipsum odit aspernatur, culpa, quisquam animi dicta beatae magnam ipsam excepturi consequuntur voluptatum magni provident at assumenda nemo! Et!",
            price: price
        });
        await camp.save();

    }
}

seedDB()
    .then(() => {
        mongoose.connection.close();
    });