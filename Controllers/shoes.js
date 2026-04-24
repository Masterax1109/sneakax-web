const shoesRouter = require('express').Router();
const Shoe = require('../models/shoe');

// POST para agregar un nuevo zapato
shoesRouter.post('/', async (request, response) => {
    try {
        // Asegúrate de extraer TODOS los campos que pide tu modelo
        const { name, brand, price, sizes, image, stock, colorway } = request.body;

        const newShoe = new Shoe({
            name,
            brand,
            price,
            sizes,
            image,
            stock,
            colorway
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

// POST para procesar checkout (bajar stock de compras)
shoesRouter.post('/checkout', async (request, response) => {
    try {
        const { cart } = request.body; // array con {id, size, ...}
        
        for (const item of cart) {
            const shoe = await Shoe.findById(item.id);
            if (shoe) {
                // Bajar el stock de la talla específica
                const sizeIndex = shoe.sizes.findIndex(s => Number(s.size) === Number(item.size));
                if (sizeIndex !== -1 && shoe.sizes[sizeIndex].stock > 0) {
                    shoe.sizes[sizeIndex].stock -= 1;
                }
                
                // Bajar el stock global (siempre que llegue a 0 global, podría mostrarse como "Agotado")
                if (shoe.stock > 0) {
                    shoe.stock -= 1;
                }
                
                await shoe.save();
            }
        }
        
        return response.status(200).json({ message: 'Stock actualizado con éxito' });
    } catch (error) {
        console.error("Error al procesar checkout:", error);
        return response.status(500).json({ error: 'Error procesando la compra' });
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

// GET para obtener un zapato por su ID
shoesRouter.get('/:id', async (request, response) => {
    try {
        const shoe = await Shoe.findById(request.params.id);
        if (!shoe) {
            return response.status(404).json({ error: 'Zapato no encontrado' });
        }
        return response.status(200).json(shoe);
    } catch (error) {
        return response.status(500).json({ error: 'Error al obtener el zapato' });
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
        const { price, stock, sizes, colorway } = request.body; // Extraemos lo que queremos permitir editar

        // Creamos un objeto solo con los campos que se van a actualizar
        const updateData = {
            price,
            stock,
            sizes,
            colorway
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

// PUT especial para marcar un zapato como portada
shoesRouter.put('/:id/feature', async (request, response) => {
    try {
        const { id } = request.params;
        
        // Primero, quitamos el "featured" a todos los zapatos de la base de datos
        await Shoe.updateMany({}, { isFeatured: false });
        
        // Luego, activamos el "featured" sólo en el zapato que nos pasaron
        const updatedShoe = await Shoe.findByIdAndUpdate(id, { isFeatured: true }, { new: true });
        
        if (!updatedShoe) {
            return response.status(404).json({ error: 'Zapato no encontrado' });
        }
        
        return response.status(200).json(updatedShoe);
    } catch (error) {
        console.error("Error al destacar zapato:", error);
        return response.status(500).json({ error: 'Error al destacar el zapato' });
    }
});

module.exports = shoesRouter;