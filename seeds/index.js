const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Destination = require('../models/touristplaces');

mongoose.connect('mongodb://localhost:27017/laughterandleisure', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Destination.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price=Math.floor(Math.random()*10000)+10;
        const camp = new Destination({
            owner:'5ff9e652faa0c05e8c244f8f',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude,cities[random1000].latitude]
              },
            image:[
                {
                  url: 'https://res.cloudinary.com/db3kjpvkf/image/upload/v1610399515/laughterandleisure/jr5ohjvkp9gud4dhlcy9.jpg',
                  filename: 'laughterandleisure/jr5ohjvkp9gud4dhlcy9'
                },
                {
                  url: 'https://res.cloudinary.com/db3kjpvkf/image/upload/v1610399517/laughterandleisure/tsjr5q5wlvde6ew14mfv.jpg',
                  filename: 'laughterandleisure/tsjr5q5wlvde6ew14mfv'
                },
                {
                  url: 'https://res.cloudinary.com/db3kjpvkf/image/upload/v1610399520/laughterandleisure/a7qweggtjt4edulsj6aw.jpg',
                  filename: 'laughterandleisure/a7qweggtjt4edulsj6aw'
                }
              ],
            price,
            date:`${new Date()}`,
            description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus volutpat nisi non leo bibendum, sed ullamcorper leo malesuada. Cras vel felis pharetra, pharetra ante consectetur, pharetra lectus. Vestibulum eu maximus lorem, elementum tincidunt lectus. Sed ornare, felis a egestas aliquam, augue turpis iaculis sapien, sed ornare urna erat vel ipsum. Fusce mauris nunc, viverra lobortis massa sit amet, egestas viverra felis. Proin sollicitudin mauris vitae justo sodales congue.'
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})