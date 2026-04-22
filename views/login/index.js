const emailInput = document.querySelector('#email-input');
const passwordInput = document.querySelector('#password-input');
const form = document.querySelector('#form');
const errorText = document.querySelector('#error-text'); // Excelente esto

form.addEventListener('submit', async e => {
    e.preventDefault();
    try {
        const user = {
            email: emailInput.value,
            password: passwordInput.value
        }
        
        await axios.post('/api/login', user);
        
        // Si no hay error, nos vamos a la tienda
        window.location.pathname = `/store/`;

    } catch (error) {
        // 1. Primero calculamos el error de forma segura
        const errorMessage = error.response?.data?.error || 'Error de conexión. Intenta de nuevo.';
        
        // 2. Imprimimos en consola para nosotros los desarrolladores
        console.error("Error en el login:", errorMessage);
        
        // 3. Lo mostramos en la pantalla para el usuario
        errorText.innerHTML = errorMessage;
        
        // Opcional: Borramos el mensaje después de 5 segundos para que no se quede ahí pegado
        setTimeout(() => {
            errorText.innerHTML = '';
        }, 5000);
    }
});