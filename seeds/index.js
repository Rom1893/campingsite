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
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, adipisci debitis! Ipsum odit aspernatur, culpa, quisquam animi dicta beatae magnam ipsam excepturi consequuntur voluptatum magni provident at assumenda nemo! Et!",
            price: price,
            image: [
                {
                    url: 'https://res.cloudinary.com/rom1893/image/upload/v1659560171/YelpCamp/q0zmobn5himh25e3zzal.jpg',
                    filename: 'YelpCamp/q0zmobn5himh25e3zzal',
                },
                {
                    url: 'https://res.cloudinary.com/rom1893/image/upload/v1659560172/YelpCamp/qqm6b8ra7btcjbvnsklp.jpg',
                    filename: 'YelpCamp/qqm6b8ra7btcjbvnsklp',
                }
            ]
        });
        await camp.save();

    }
}

seedDB()
    .then(() => {
        mongoose.connection.close();
    });