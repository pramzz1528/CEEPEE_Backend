const mongoose = require('mongoose');
const Room = require('./models/Room');
const Material = require('./models/Material');
require('dotenv').config();

const rooms = [
    {
        name: 'Grand Living Room (Wide Floor View)',
        imageUrl: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        floorCoordinates: [[0, 800], [1600, 800], [1200, 300], [400, 300]]
    },
    {
        name: 'Spacious Hallway',
        imageUrl: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        floorCoordinates: [[0, 900], [1600, 900], [1000, 400], [600, 400]]
    },
    {
        name: 'Modern Open Kitchen',
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        floorCoordinates: [[100, 800], [1500, 800], [1200, 300], [400, 300]]
    },
    {
        name: 'Empty Room for Flooring',
        imageUrl: 'https://images.unsplash.com/photo-1581456495146-65a71b2c8e52?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
        floorCoordinates: [[0, 1000], [1600, 1000], [1600, 0], [0, 0]]
    }
];

const materials = [
    // Beige Family
    { name: 'Beige Matte Tile', type: 'Tile', textureUrl: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', colorFamily: 'Beige', finish: 'Matte', size: '60x60', brightness: 'Light' },
    { name: 'Classic Travertine', type: 'Marble', textureUrl: 'https://images.unsplash.com/photo-1615996001375-c7ef13294436?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', colorFamily: 'Beige', finish: 'Glossy', size: '120x60', brightness: 'Medium' },

    // Black/Dark Family
    { name: 'Black Galaxy', type: 'Marble', textureUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', colorFamily: 'Black', finish: 'Glossy', size: '60x60', brightness: 'Dark' },
    { name: 'Slate Grey Tile', type: 'Tile', textureUrl: 'https://images.unsplash.com/photo-1588636402741-28564e9a31a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', colorFamily: 'Black', finish: 'Matte', size: '60x60', brightness: 'Dark' },

    // White Family
    { name: 'Carrara White', type: 'Marble', textureUrl: 'https://images.unsplash.com/photo-1594912959648-8df0410ad56d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', colorFamily: 'White', finish: 'Glossy', size: '60x60', brightness: 'Light' },
    { name: 'White Concrete', type: 'Tile', textureUrl: 'https://images.unsplash.com/photo-1528644784468-b3d978a637d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', colorFamily: 'White', finish: 'Matte', size: '60x60', brightness: 'Light' }
];

async function seedDB() {
    try {
        console.log('Connecting to MongoDB at', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        await Room.deleteMany({});
        await Material.deleteMany({});

        await Room.insertMany(rooms);
        await Material.insertMany(materials);

        console.log('Database Seeded Successfully');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedDB();
