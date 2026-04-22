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

    } catch (error) {
        console.log('Modo visitante activado.');
    }
};

checkSession();