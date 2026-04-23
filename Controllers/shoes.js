const shoesRouter = require('express').Router();
const Shoe = require('../models/shoe');

// POST para agregar un nuevo zapato
shoesRouter.post('/', async (request, response) => {
    try {
        // Asegúrate de extraer TODOS los campos que pide tu modelo
        const { name, brand, price, sizes, image, stock } = request.body;

        const newShoe = new Shoe({
            name,
            brand,
            price,
            sizes,
            image,
            stock
        });

        // Guardamos en la base de datos
        const savedShoe = await newShoe.save();
        return response.status(201).json(savedShoe);
        
    } catch (error) {
        // imprimir el error en consola para saber qué falló
        console.error("Error al guardar:", error);
        return response.status(400).json({ error: 'Error al guardar el zapato' });
    }
});

// GET para obtener todos los zapatos de la tienda
shoesRouter.get('/', async (request, response) => {
    try {
        // Busca todos los zapatos en la base de datos
        const shoes = await Shoe.find({});
        return response.status(200).json(shoes);
    } catch (error) {
        return response.status(500).json({ error: 'Error al obtener los zapatos' });
    }
});


module.exports = shoesRouter;