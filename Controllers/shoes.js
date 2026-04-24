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

// DELETE para eliminar un zapato por su ID
shoesRouter.delete('/:id', async (request, response) => {
    try {
        await Shoe.findByIdAndDelete(request.params.id);
        return response.status(204).end(); // 204 significa "Sin contenido" (se borró con éxito)
    } catch (error) {
        return response.status(400).json({ error: 'Error al eliminar el zapato' });
    }
});

// PUT para actualizar un zapato existente
shoesRouter.put('/:id', async (request, response) => {
    try {
        const { id } = request.params;
        const { price, stock, sizes } = request.body; // Extraemos lo que queremos permitir editar

        // Creamos un objeto solo con los campos que se van a actualizar
        const updateData = {
            price,
            stock,
            sizes
        };

        // findByIdAndUpdate busca por ID y actualiza. 
        // { new: true } devuelve el documento actualizado en lugar del original.
        const updatedShoe = await Shoe.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedShoe) {
            return response.status(404).json({ error: 'Zapato no encontrado' });
        }

        return response.status(200).json(updatedShoe);
    } catch (error) {
        console.error("Error al actualizar:", error);
        return response.status(400).json({ error: 'Error al actualizar el zapato' });
    }
});

module.exports = shoesRouter;