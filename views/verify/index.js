const textInfo = document.querySelector('#text-info'); // Selector: Atrapa el párrafo del HTML donde mostraremos los mensajes.

(async () => {
    // IIFE (Immediately Invoked Function Expression): Es una función que se ejecuta solita en cuanto carga la página. 
    // Se usa 'async' porque adentro vamos a esperar una respuesta del servidor (Axios).
    try {
        // window.location.pathname: Obtiene la ruta de la barra de direcciones (ej: "/verify/123/token").
        // .split('/'): Rompe esa ruta en pedazos usando las barras diagonales.
        const token = window.location.pathname.split('/')[3]; // Toma el cuarto pedazo (el Token)
        const id = window.location.pathname.split('/')[2]; // Toma el tercer pedazo (el ID del usuario).
      
        // Axios Patch: Envía una "actualización" al servidor. 
        // Le dice al backend: "Oye, este ID con este Token quiere verificarse".
        const { data } = await axios.patch(`/api/users/${id}/${token}`);
       
        // Muestra "Usuario verificado"
        textInfo.innerHTML = data; // Inyecta ese texto en el HTML para que el usuario lo vea (el: "Usuario verificado")
        // Esperamos 2 segundos y redirigimos
        setTimeout(() => {
            window.location.pathname = '/login/';
        }, 2000); 
    } catch (error) {
        // Si el link expiró o el backend falla, atrapamos el error con seguridad
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error al verificar. El link puede haber expirado.';
        textInfo.innerHTML = errorMessage;
    }
})();