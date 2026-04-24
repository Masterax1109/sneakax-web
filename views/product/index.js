// DOM Elements
const loader = document.querySelector('#loader');
const errorMessage = document.querySelector('#error-message');
const productContainer = document.querySelector('#product-container');

// Shoe UI Elements
const shoeImage = document.querySelector('#shoe-image');
const shoeBrand = document.querySelector('#shoe-brand');
const shoeName = document.querySelector('#shoe-name');
const shoePrice = document.querySelector('#shoe-price');
const shoeSizes = document.querySelector('#shoe-sizes');
const shoeColorwaySubtitle = document.querySelector('#shoe-colorway-subtitle');
const shoeColorwayUI = document.querySelector('#shoe-colorway-ui');
const buyBtn = document.querySelector('#buy-btn');
const cartMessage = document.querySelector('#cart-message');

// Estado local
let currentShoeData = null;
let selectedSize = null;

// Navbar Elements
const guestMenu = document.querySelector('#guest-menu');
const loggedMenu = document.querySelector('#logged-menu');
const hamburgerMenu = document.querySelector('#hamburger-menu');
const dropdownMenu = document.querySelector('#dropdown-menu');
const logoutBtn = document.querySelector('#logout-btn');

// Lógica de Menú
if (hamburgerMenu) {
    hamburgerMenu.addEventListener('click', () => {
        dropdownMenu.classList.toggle('hidden');
    });
}

// Lógica para cerrar sesión
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await axios.post('/api/users/logout');
            window.location.reload();
        } catch (error) {
            console.error('Error al cerrar sesión', error);
        }
    });
}

// Chequear Sesión
const checkSession = async () => {
    try {
        const { data } = await axios.get('/api/users/me');
        
        if (guestMenu) guestMenu.classList.add('hidden');
        if (loggedMenu) {
            loggedMenu.classList.remove('hidden');
            loggedMenu.classList.add('flex');
        }

        if (data.rol === 'admin') {
            const adminPanelLink = document.querySelector('#admin-panel-link');
            if (adminPanelLink) {
                adminPanelLink.innerHTML = `
                    <a href="/admin" class="block w-full text-left px-4 py-3 text-sm font-bold text-indigo-600 hover:bg-gray-100 transition border-b border-gray-200">
                        ⚙️ Panel de Control
                    </a>
                `;
            }
        }
    } catch (error) {
        console.log('Modo visitante activado.');
        guestMenu.classList.remove('hidden');
        loggedMenu.classList.add('hidden');
    }
};

// Cargar Zapato
const loadShoe = async () => {
    // Extraer el ID de la url: /product?id=...
    const urlParams = new URLSearchParams(window.location.search);
    const shoeId = urlParams.get('id');

    if (!shoeId) {
        loader.classList.add('hidden');
        errorMessage.classList.remove('hidden');
        return;
    }

    try {
        const { data } = await axios.get(`/api/shoes/${shoeId}`);
        currentShoeData = data; // Guardar en estado global para el carrito
        
        // Rellenar datos
        shoeImage.src = data.image || '/images/placeholder.png';
        shoeImage.alt = data.name;
        shoeBrand.textContent = data.brand;
        shoeName.textContent = data.name;
        shoePrice.textContent = `$${data.price}`;
        if (shoeColorwaySubtitle) shoeColorwaySubtitle.textContent = data.colorway || 'N/A';
        if (shoeColorwayUI) shoeColorwayUI.textContent = data.colorway || 'N/A';

        // Limpiar tamaños y renderizar
        shoeSizes.innerHTML = '';
        if (data.sizes && data.sizes.length > 0) {
            data.sizes.forEach(s => {
                const sizeVal = typeof s === 'number' ? s : s.size;
                const stockVal = typeof s === 'number' ? 1 : s.stock; // Backward compatibility

                const btn = document.createElement('button');
                btn.className = 'w-14 h-10 border-2 border-[#FF5722] bg-[#FF5722] text-black bg-opacity-90 font-extrabold rounded-lg shadow-sm transition flex items-center justify-center';
                
                if (stockVal <= 0) {
                    // Estilo para Sin Stock
                    btn.classList.add('opacity-40', 'cursor-not-allowed', 'bg-gray-300', 'border-gray-300');
                    btn.classList.remove('bg-[#FF5722]', 'border-[#FF5722]');
                    btn.disabled = true;
                    btn.title = 'Sin Stock';
                } else {
                    // Estilo normal
                    btn.classList.add('hover:scale-105', 'hover:bg-orange-500', 'cursor-pointer', 'size-btn');
                    
                    // Listener de selección
                    btn.addEventListener('click', () => {
                        selectedSize = sizeVal;
                        
                        // Quitar borde a todos los botones habilitados
                        document.querySelectorAll('.size-btn').forEach(b => {
                            b.classList.remove('ring-4', 'ring-black');
                        });
                        
                        // Agregar borde remarcado al seleccionado
                        btn.classList.add('ring-4', 'ring-black');
                    });
                }
                
                btn.textContent = sizeVal;
                shoeSizes.appendChild(btn);
            });
        } else {
            shoeSizes.innerHTML = '<span class="text-sm font-bold text-gray-400">Sin tallas registradas</span>';
        }

        // Mostrar UI
        loader.classList.add('hidden');
        productContainer.classList.remove('hidden');
        productContainer.classList.add('flex');
    } catch (error) {
        console.error('Error fetching shoe:', error);
        loader.classList.add('hidden');
        errorMessage.classList.remove('hidden');
    }
};

// Lógica del botón de compra
if (buyBtn) {
    buyBtn.addEventListener('click', () => {
        if (!selectedSize) {
            cartMessage.textContent = 'Por favor, selecciona una talla primero.';
            cartMessage.classList.remove('hidden', 'text-green-600');
            cartMessage.classList.add('text-red-500', 'opacity-100');
            
            setTimeout(() => {
                cartMessage.classList.remove('opacity-100');
                cartMessage.classList.add('opacity-0');
                setTimeout(() => cartMessage.classList.add('hidden'), 500);
            }, 3000);
            return;
        }

        // Recuperar carrito existente
        const cart = JSON.parse(localStorage.getItem('sneakax_cart')) || [];
        
        // Agregar nuevo zapato
        cart.push({
            id: currentShoeData.id,
            name: currentShoeData.name,
            brand: currentShoeData.brand,
            price: currentShoeData.price,
            image: currentShoeData.image,
            size: selectedSize
        });
        
        // Guardar en almacenamiento local
        localStorage.setItem('sneakax_cart', JSON.stringify(cart));

        // Mostrar animación en sidebar
        cartMessage.textContent = '¡Agregado al carrito!';
        cartMessage.classList.remove('hidden', 'text-red-500');
        cartMessage.classList.add('text-green-600', 'opacity-100');
        
        // Cargar vista del sidebar
        openCart();
        
        setTimeout(() => {
            cartMessage.classList.remove('opacity-100');
            cartMessage.classList.add('opacity-0');
            setTimeout(() => cartMessage.classList.add('hidden'), 500);
        }, 3000);
    });
}

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

// Inicialización
checkSession();
loadShoe();
