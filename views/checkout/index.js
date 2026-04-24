const checkoutItemsContainer = document.querySelector('#checkout-items');
const subtotalLabel = document.querySelector('#subtotal-label');
const checkoutTotalLabel = document.querySelector('#checkout-total');
const radios = document.querySelectorAll('input[name="payment"]');
const detailBoxes = document.querySelectorAll('.payment-details');
const referenceInput = document.querySelector('#reference-input');
const confirmPayBtn = document.querySelector('#confirm-pay-btn');
const referenceError = document.querySelector('#reference-error');
const successModal = document.querySelector('#success-modal');
const successModalContent = document.querySelector('#success-modal-content');
const backStoreBtn = document.querySelector('#back-store-btn');

// 1. Mostrar/ocultar detalles de pago
radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        // Ocultar todos los detalles
        detailBoxes.forEach(box => {
            box.classList.add('hidden');
        });
        
        // Mostrar el del seleccionado
        const targetId = `${e.target.value}-details`;
        const targetBox = document.getElementById(targetId);
        if (targetBox) {
            targetBox.classList.remove('hidden');
        }
    });
});

// 2. Cargar carrito del localStorage
const renderCheckoutCart = () => {
    const cart = JSON.parse(localStorage.getItem('sneakax_cart')) || [];
    checkoutItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        // Si no hay carrito, mandamos a la tienda enseguida
        window.location.href = '/store';
        return;
    }

    cart.forEach(item => {
        total += Number(item.price);
        const el = document.createElement('div');
        el.className = 'flex items-center gap-4 bg-gray-50 border border-gray-100 p-3 rounded-xl';
        el.innerHTML = `
            <div class="w-20 h-20 bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                <img src="${item.image || '/images/placeholder.png'}" alt="${item.name}" class="object-contain w-full h-full drop-shadow-sm">
            </div>
            <div class="flex-1 flex flex-col justify-center">
                <div class="font-extrabold text-sm leading-tight text-gray-800 uppercase">${item.name}</div>
                <div class="text-[10px] text-gray-500 font-bold uppercase mt-1">${item.brand} | Talla: ${item.size}</div>
            </div>
            <div class="text-[#FF5722] font-black text-lg pr-2">
                $${item.price}
            </div>
        `;
        checkoutItemsContainer.appendChild(el);
    });

    subtotalLabel.textContent = '$' + total;
    checkoutTotalLabel.textContent = '$' + total;
};

// 3. Confirmar pago (vaciar carrito, bajar stock y mostrar modal)
confirmPayBtn.addEventListener('click', async () => {
    const refText = referenceInput.value.trim();
    
    if (!refText) {
        referenceError.classList.remove('hidden');
        referenceInput.classList.add('border-red-500');
        referenceInput.focus();
        return;
    }
    
    referenceError.classList.add('hidden');
    referenceInput.classList.remove('border-red-500');
    
    // Deshabilitar botón para evitar multiclips
    confirmPayBtn.disabled = true;
    confirmPayBtn.textContent = 'PROCESANDO...';

    const cart = JSON.parse(localStorage.getItem('sneakax_cart')) || [];

    try {
        // Enviar la petición al backend para descontar el stock
        await axios.post('/api/shoes/checkout', { cart });

        // Si es exitoso, vaciamos el carrito local
        localStorage.removeItem('sneakax_cart');

        // Mostrar modal con un pequeño efecto visual
        successModal.classList.remove('hidden');
        setTimeout(() => {
            successModalContent.classList.remove('scale-95', 'opacity-0');
            successModalContent.classList.add('scale-100', 'opacity-100');
        }, 10);
        
    } catch (error) {
        console.error("Error al procesar la compra:", error);
        alert("Lo sentimos, ocurrió un error procesando tu compra. Por favor, intenta de nuevo.");
        confirmPayBtn.disabled = false;
        confirmPayBtn.textContent = 'CONFIRMAR PAGO';
    }
});

// 4. Volver a tienda luego del pago
backStoreBtn.addEventListener('click', () => {
    successModalContent.classList.remove('scale-100', 'opacity-100');
    successModalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        window.location.href = '/store';
    }, 300);
});

// Inicializar la vista cargando el carrito
renderCheckoutCart();
