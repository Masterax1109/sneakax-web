const mongoose = require('mongoose');

const shoeSchema = new mongoose.Schema({
    name: { type: String, required: true }, 
    brand: { type: String, required: true }, 
    price: { type: Number, required: true }, 
    colorway: { type: String, default: 'N/A' },
    sizes: [{ 
        size: { type: Number, required: true },
        stock: { type: Number, default: 0 }
    }], 
    image: { type: String }, // Aquí se el link de la foto
    stock: { type: Number, default: 1 } // Cuántos pares tienes
});

// Limpiamos el _id y __v al enviarlo al frontend (como hiciste con el user)
shoeSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

const Shoe = mongoose.model('Shoe', shoeSchema);
module.exports = Shoe;