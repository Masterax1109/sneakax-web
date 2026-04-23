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

addShoeForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    // 1. Capturamos los datos básicos
    const brand = document.querySelector('#shoe-brand').value;
    const name = document.querySelector('#shoe-model').value; 
    const price = document.querySelector('#shoe-price').value;
    const image = document.querySelector('#shoe-image-url').value;
    
    // 2. Capturamos los nuevos campos
    const stockInput = document.querySelector('#shoe-stock').value;
    const sizesInput = document.querySelector('#shoe-sizes').value;

    // 3. Transformamos los datos al formato que pide MongoDB
    const stock = Number(stockInput); // Aseguramos que sea un número
    
    // Convertimos "40, 41, 42" -> [40, 41, 42]
    const sizes = sizesInput
        .split(',') // Corta el texto por las comas
        .map(size => Number(size.trim())) // Le quita espacios y lo vuelve número
        .filter(size => !isNaN(size) && size !== 0); // Filtra por si pusiste una coma de más

    try {
        // Enviamos al backend
        await axios.post('/api/shoes', { 
            name, 
            brand, 
            price, 
            sizes, 
            image, 
            stock 
        });
        
        alert('¡Zapato agregado con éxito a la base de datos! 👟');
        loadInventory();
        addShoeForm.reset();

    } catch (error) {
        console.error('Error del servidor:', error);
        alert('Hubo un error al guardar el zapato. Revisa la consola.');
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

// 3. Función temporal para Editar (La programaremos luego)
window.editShoe = (id) => {
    alert('🛠️ ¡Pronto programaremos la función de editar! ID: ' + id);
};

// Ejecutamos la carga apenas se abre el panel
loadInventory();