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

    // Capturamos los datos de los inputs
    const brand = document.querySelector('#shoe-brand').value;
    
    // AQUÍ ESTÁ LA MAGIA: Tomamos el input "shoe-model" pero lo guardamos en la variable "name"
    const name = document.querySelector('#shoe-model').value; 
    
    const price = document.querySelector('#shoe-price').value;
    const image = document.querySelector('#shoe-image-url').value;
    
    // Valores por defecto para que MongoDB no dé error por los campos "required"
    const sizes = [40, 41, 42, 43]; 
    const stock = 10;

    try {
        // Enviamos al backend exactamente como lo pide tu Schema
        await axios.post('/api/shoes', { 
            name, // Ahora "name" lleva el valor de tu input "modelo"
            brand, 
            price, 
            sizes, 
            image, 
            stock 
        });
        
        alert('¡Zapato agregado con éxito a la base de datos! 👟');
        addShoeForm.reset();

    } catch (error) {
        console.error('Error del servidor:', error);
        alert('Hubo un error al guardar el zapato. Revisa la consola.');
    }
});

