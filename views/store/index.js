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
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            console.log("Intentando cerrar sesión...");
            await axios.post('/api/users/logout');
            window.location.pathname = '/store/';
        } catch (error) {
            console.error('Error al cerrar sesión', error);
        }
    });
}

// 4. Lógica para revisar si estamos logueados al cargar la página
const checkSession = async () => {
    try {
        const { data } = await axios.get('/api/users/me');
        
        if (guestMenu) guestMenu.classList.add('hidden');
        if (loggedMenu) {
            loggedMenu.classList.remove('hidden');
            loggedMenu.classList.add('flex');
        }

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
const searchInput = document.querySelector('#search-input');
let allShoes = []; // Variable global para guardar los zapatos

// Función que dibuja en pantalla el arreglo de zapatos que le pases
const renderShoes = (shoesArray) => {
    shoesContainer.innerHTML = '';
    
    if (shoesArray.length === 0) {
        shoesContainer.innerHTML = '<p class="col-span-full text-center text-gray-500 font-bold text-xl mt-8">No se encontraron resultados para tu búsqueda.</p>';
        return;
    }
    
    shoesArray.forEach(shoe => {
        const shoeCard = document.createElement('div');
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
                    <a href="/product?id=${shoe.id}" class="bg-black text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-[#FF5722] hover:text-black transition-colors duration-300">
                        VER MÁS
                    </a>
                </div>
            </div>
        `;
        shoesContainer.appendChild(shoeCard);
    });
};

const loadShoes = async () => {
    try {
        const { data } = await axios.get('/api/shoes');
        allShoes = data; // Guardamos en memoria para filtrar rápido
        
        // --- Buscar el zapato destacado y actualizar la Portada ---
        const featureShoe = allShoes.find(s => s.isFeatured === true);
        const heroImg = document.querySelector('#hero-shoe-image img');
        const heroBuyBtn = document.querySelector('#hero-buy-btn');
        
        if (featureShoe && heroImg && heroBuyBtn) {
            heroImg.src = featureShoe.image || '/images/placeholder.png';
            heroImg.alt = featureShoe.name;
            // Dirigir al checkout al comprar la portada, o al producto. Le ponemos la ruta de su vista.
            heroBuyBtn.onclick = () => window.location.href = `/product?id=${featureShoe.id}`;
        } else if (!featureShoe && allShoes.length > 0 && heroImg && heroBuyBtn) {
            // Si ninguno está destacado, ponemos el más reciente
            const lastShoe = allShoes[allShoes.length - 1];
            heroImg.src = lastShoe.image || '/images/placeholder.png';
            heroImg.alt = lastShoe.name;
            heroBuyBtn.onclick = () => window.location.href = `/product?id=${lastShoe.id}`;
        }
        
        renderShoes(allShoes); // Dibujamos todos al principio
    } catch (error) {
        console.error('Error al cargar los zapatos:', error);
        shoesContainer.innerHTML = '<p class="col-span-full text-center text-red-500 font-bold mt-8">Hubo un error al cargar el catálogo.</p>';
    }
};

// Evento que se dispara cada vez que escribimos en la barra de búsqueda
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchText = e.target.value.toLowerCase().trim();
        
        // Filtramos buscando coincidencias en la marca o el modelo
        const filteredShoes = allShoes.filter(shoe => {
            const brandMatch = shoe.brand && shoe.brand.toLowerCase().includes(searchText);
            const modelMatch = shoe.name && shoe.name.toLowerCase().includes(searchText);
            return brandMatch || modelMatch;
        });
        
        renderShoes(filteredShoes);
    });
}

// Ejecutamos la función apenas cargue la página
loadShoes();
checkSession();

// ============================================
// LÓGICA DEL CARRITO (SIDEBAR)
// ============================================
const cartIcon = document.querySelector('#cart-icon');
const closeCartBtn = document.querySelector('#close-cart-btn');
const cartSidebar = document.querySelector('#cart-sidebar');
const cartOverlay = document.querySelector('#cart-overlay');
const cartItemsContainer = document.querySelector('#cart-items');
const cartTotalLabel = document.querySelector('#cart-total');

const openCart = () => {
    cartSidebar.classList.remove('translate-x-full');
    cartOverlay.classList.remove('hidden', 'opacity-0');
    cartOverlay.classList.add('opacity-100');
    renderCart();
};

const closeCart = () => {
    cartSidebar.classList.add('translate-x-full');
    cartOverlay.classList.remove('opacity-100');
    cartOverlay.classList.add('opacity-0');
    setTimeout(() => cartOverlay.classList.add('hidden'), 300);
};

if (cartIcon) cartIcon.addEventListener('click', openCart);
if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

const renderCart = () => {
    const cart = JSON.parse(localStorage.getItem('sneakax_cart')) || [];
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-gray-500 font-bold text-center mt-10">Tu carrito está vacío.</p>';
        cartTotalLabel.textContent = '$0';
        return;
    }

    cart.forEach((item, index) => {
        total += Number(item.price);
        const itemEl = document.createElement('div');
        itemEl.className = 'flex items-center gap-4 border-b border-gray-100 pb-4';
        itemEl.innerHTML = `
            <div class="w-16 h-16 bg-white border border-gray-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                <img src="${item.image || '/images/placeholder.png'}" alt="${item.name}" class="object-contain w-full h-full">
            </div>
            <div class="flex-1">
                <div class="font-extrabold text-sm leading-tight">${item.name}</div>
                <div class="text-[10px] text-gray-500 font-bold uppercase mt-0.5">${item.brand} | Talla: ${item.size}</div>
                <div class="text-[#FF5722] font-black text-sm mt-1">$${item.price}</div>
            </div>
            <button onclick="removeCartItem(${index})" class="text-gray-400 hover:text-red-500 transition px-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
        `;
        cartItemsContainer.appendChild(itemEl);
    });

    cartTotalLabel.textContent = '$' + total;
};

window.removeCartItem = (index) => {
    let cart = JSON.parse(localStorage.getItem('sneakax_cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('sneakax_cart', JSON.stringify(cart));
    renderCart();
};