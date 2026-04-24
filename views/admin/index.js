// Lógica para las pestañas de la imagen
const tabUrl = document.getElementById('tab-url');
const tabFile = document.getElementById('tab-file');
const inputUrl = document.getElementById('input-url');
const inputFile = document.getElementById('input-file');

tabUrl.addEventListener('click', () => {
    // Mostrar URL, ocultar Archivo
    inputUrl.classList.remove('hidden');
    inputFile.classList.add('hidden');
    
    // Cambiar estilos de las pestañas
    tabUrl.classList.add('border-black', 'text-black');
    tabUrl.classList.remove('border-transparent', 'text-gray-400');
    
    tabFile.classList.add('border-transparent', 'text-gray-400');
    tabFile.classList.remove('border-black', 'text-black');
});

tabFile.addEventListener('click', () => {
    // Mostrar Archivo, ocultar URL
    inputFile.classList.remove('hidden');
    inputUrl.classList.add('hidden');
    
    // Cambiar estilos de las pestañas
    tabFile.classList.add('border-black', 'text-black');
    tabFile.classList.remove('border-transparent', 'text-gray-400');
    
    tabUrl.classList.add('border-transparent', 'text-gray-400');
    tabUrl.classList.remove('border-black', 'text-black');
});

const addShoeForm = document.querySelector('#add-shoe-form');

// ... (código previo de pestañas)

// ESTO ES EL PASO B: Reemplaza tu actual addShoeForm.addEventListener
addShoeForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    // Capturamos el ID oculto para saber si editamos o creamos
    const id = document.querySelector('#shoe-id').value; 
    
    const brand = document.querySelector('#shoe-brand').value;
    const name = document.querySelector('#shoe-model').value; 
    const colorway = document.querySelector('#shoe-colorway').value; 
    const price = Number(document.querySelector('#shoe-price').value);
    const image = document.querySelector('#shoe-image-url').value;
    
    // Convertir el formato "40:5, 41:2" a [{size: 40, stock: 5}, {size: 41, stock: 2}]
    const sizesInput = document.querySelector('#shoe-sizes').value;
    const sizes = sizesInput.split(',')
        .map(item => {
            const parts = item.split(':');
            if (parts.length === 2) {
                return { size: Number(parts[0].trim()), stock: Number(parts[1].trim()) };
            }
            return { size: Number(item.trim()), stock: 0 }; // Fallback
        })
        .filter(s => !isNaN(s.size) && s.size !== 0);

    // Calcular stock global en base a las tallas
    const stock = sizes.reduce((acc, curr) => acc + (curr.stock || 0), 0);

    try {
        if (id) {
            // Si hay ID, llamamos a la ruta PUT que creaste en shoes.js
            await axios.put(`/api/shoes/${id}`, { price, stock, sizes, colorway });
            alert('¡Sneaker actualizado con éxito! 🔄');
        } else {
            // Si no hay ID, es un zapato nuevo (POST)
            await axios.post('/api/shoes', { name, brand, price, sizes, image, stock, colorway });
            alert('¡Zapato agregado con éxito! 👟');
        }
        
        // Limpiamos el ID oculto y restauramos el botón
        document.querySelector('#shoe-id').value = ''; 
        const submitBtn = addShoeForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Guardar en Base de Datos';
        submitBtn.classList.replace('bg-blue-600', 'bg-black');
        
        addShoeForm.reset();
        loadInventory();

    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al procesar la solicitud.');
    }
});

// --- LÓGICA DE LA TABLA DE INVENTARIO ---
const inventoryList = document.querySelector('#inventory-list');

// 1. Función para cargar los zapatos en la tabla
const loadInventory = async () => {
    try {
        const { data } = await axios.get('/api/shoes');
        inventoryList.innerHTML = ''; // Limpiamos la tabla
        
        if (data.length === 0) {
            inventoryList.innerHTML = `
                <tr>
                    <td colspan="5" class="p-8 text-center text-gray-400 font-bold">
                        El inventario está vacío. Agrega tu primer par arriba.
                    </td>
                </tr>`;
            return;
        }

        // Recorremos los zapatos y creamos las filas (tr)
        data.forEach(shoe => {
            const row = document.createElement('tr');
            row.classList.add('hover:bg-gray-50', 'transition');
            
            row.innerHTML = `
                <td class="p-4">
                    <div class="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        <img src="${shoe.image}" alt="${shoe.name}" class="object-contain w-full h-full p-1">
                    </div>
                </td>
                <td class="p-4">
                    <div class="font-extrabold text-black text-sm">${shoe.name}</div>
                    <div class="text-xs text-gray-500 font-bold uppercase mt-1">${shoe.brand}</div>
                </td>
                <td class="p-4 font-bold text-gray-800">$${shoe.price}</td>
                <td class="p-4 font-bold text-gray-800">${shoe.stock} unds.</td>
                <td class="p-4 text-center space-x-3">
                    <button onclick="editShoe('${shoe.id}')" class="text-blue-500 hover:text-blue-700 font-bold text-xs transition uppercase tracking-wide">Editar</button>
                    <button onclick="deleteShoe('${shoe.id}')" class="text-red-500 hover:text-red-700 font-bold text-xs transition uppercase tracking-wide">Eliminar</button>
                </td>
            `;
            inventoryList.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar inventario:', error);
    }
};

// 2. Función para Eliminar un zapato
window.deleteShoe = async (id) => {
    // Pedimos confirmación para evitar borrados por accidente
    if (confirm('⚠️ ¿Estás seguro de que deseas eliminar este sneaker de la base de datos?')) {
        try {
            await axios.delete(`/api/shoes/${id}`);
            loadInventory(); // Recargamos la tabla para que desaparezca
        } catch (error) {
            alert('Hubo un error al eliminar el zapato.');
        }
    }
};

window.editShoe = async (id) => {
    try {
        // 1. Buscamos el zapato actual en el inventario cargado (para no hacer otra petición a la DB)
        const { data: shoes } = await axios.get('/api/shoes');
        const shoeToEdit = shoes.find(s => s.id === id);

        if (shoeToEdit) {
            // 2. Llenamos el formulario con los datos actuales
            document.querySelector('#shoe-id').value = shoeToEdit.id;
            document.querySelector('#shoe-brand').value = shoeToEdit.brand;
            document.querySelector('#shoe-model').value = shoeToEdit.name;
            document.querySelector('#shoe-colorway').value = shoeToEdit.colorway || '';
            document.querySelector('#shoe-price').value = shoeToEdit.price;
            
            // Format sizes to string "size:stock, size:stock"
            let sizesStr = '';
            if (shoeToEdit.sizes && shoeToEdit.sizes.length > 0) {
                sizesStr = shoeToEdit.sizes.map(s => {
                    // Soporte para ambos modelos en DB (antiguo: Number, nuevo: Object)
                    if (typeof s === 'number') return `${s}:0`;
                    return `${s.size}:${s.stock}`;
                }).join(', ');
            }
            document.querySelector('#shoe-sizes').value = sizesStr;
            
            document.querySelector('#shoe-image-url').value = shoeToEdit.image;

            // 3. Cambiamos el texto del botón para indicar que estamos editando
            const submitBtn = addShoeForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Actualizar Sneaker';
            submitBtn.classList.replace('bg-black', 'bg-blue-600');
            
            // Subimos el scroll hasta el formulario
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error al cargar datos para editar:', error);
    }
};

// Ejecutamos la carga apenas se abre el panel
loadInventory();