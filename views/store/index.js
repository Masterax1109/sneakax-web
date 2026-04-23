// 1. Atrapamos todos los elementos del HTML
const guestMenu = document.querySelector('#guest-menu');
const loggedMenu = document.querySelector('#logged-menu');
const hamburgerMenu = document.querySelector('#hamburger-menu');
const dropdownMenu = document.querySelector('#dropdown-menu');
const logoutBtn = document.querySelector('#logout-btn'); // ¡Esta línea es CLAVE!

// 2. Lógica para abrir/cerrar el menú desplegable
hamburgerMenu.addEventListener('click', () => {
    dropdownMenu.classList.toggle('hidden');
});

// 3. Lógica para cerrar sesión
logoutBtn.addEventListener('click', async () => {
    try {
        console.log("Intentando cerrar sesión..."); // Agregamos esto para ver si el clic funciona
        await axios.post('/api/users/logout');
        
        // Si el backend responde bien, recargamos la página
        window.location.pathname = '/store/'; // Forzamos la recarga a la ruta principal
    } catch (error) {
        console.error('Error al cerrar sesión', error);
    }
});

// 4. Lógica para revisar si estamos logueados al cargar la página
const checkSession = async () => {
    try {
        const { data } = await axios.get('/api/users/me');
        
        guestMenu.classList.add('hidden');
        loggedMenu.classList.remove('hidden');
        loggedMenu.classList.add('flex');

        console.log(`¡Bienvenido ${data.name}! Tu rol es: ${data.rol}`);

        // --- NUEVO CÓDIGO DE ADMIN AQUÍ ---
        // Si el usuario tiene rol de admin, inyectamos el enlace en el menú
        if (data.rol === 'admin') {
            const adminPanelLink = document.querySelector('#admin-panel-link');
            // Inyectamos el HTML del botón dentro del div vacío que dejamos en el navbar
            adminPanelLink.innerHTML = `
                <a href="/admin" class="block w-full text-left px-4 py-3 text-sm font-bold text-indigo-600 hover:bg-gray-100 transition border-b border-gray-200">
                    ⚙️ Panel de Control
                </a>
            `;
        }
        

    } catch (error) {
        console.log('Modo visitante activado.');
    }
};

// 5. Lógica para cargar y mostrar los zapatos en la tienda
const shoesContainer = document.querySelector('#shoes-container');

const loadShoes = async () => {
    try {
        // Le pedimos los zapatos al backend
        const { data } = await axios.get('/api/shoes');

        // Limpiamos el contenedor por si acaso
        shoesContainer.innerHTML = '';

        // Si la base de datos está vacía
        if (data.length === 0) {
            shoesContainer.innerHTML = '<p class="col-span-full text-center text-gray-500 font-bold text-xl mt-8">Aún no hay zapatos disponibles.</p>';
            return;
        }

        // Recorremos cada zapato y creamos su tarjeta HTML
        data.forEach(shoe => {
            const shoeCard = document.createElement('div');
            // Le damos el estilo de tarjeta con bordes redondeados (rounded-2xl)
            shoeCard.classList.add('bg-white', 'rounded-2xl', 'shadow-lg', 'overflow-hidden', 'flex', 'flex-col', 'hover:shadow-xl', 'transition-shadow', 'duration-300');
            
            shoeCard.innerHTML = `
                <!-- Contenedor de la Imagen -->
                <div class="h-56 bg-gray-50 flex items-center justify-center p-6 border-b border-gray-100">
                    <img src="${shoe.image}" alt="${shoe.name}" class="object-contain h-full w-full drop-shadow-md hover:scale-105 transition-transform duration-300">
                </div>
                <!-- Contenido de la Tarjeta -->
                <div class="p-6 flex flex-col flex-grow">
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">${shoe.brand}</span>
                    <h3 class="text-xl font-extrabold text-black mb-4">${shoe.name}</h3>
                    
                    <div class="mt-auto flex justify-between items-center">
                        <span class="text-2xl font-black text-[#FF5722]">$${shoe.price}</span>
                        <button class="bg-black text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-[#FF5722] hover:text-black transition-colors duration-300">
                            VER MÁS
                        </button>
                    </div>
                </div>
            `;
            
            // Metemos la tarjeta terminada en el contenedor gris
            shoesContainer.appendChild(shoeCard);
        });

    } catch (error) {
        console.error('Error al cargar los zapatos:', error);
        shoesContainer.innerHTML = '<p class="col-span-full text-center text-red-500 font-bold mt-8">Hubo un error al cargar el catálogo.</p>';
    }
};

// Ejecutamos la función apenas cargue la página
loadShoes();



checkSession();