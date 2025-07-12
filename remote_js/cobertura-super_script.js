(function() {
    /**
     * Función para enviar mensajes de log a la consola nativa de Android o al navegador.
     * @param {string} message - El mensaje a registrar.
     */
    function nativeLog(message) {
        try {
            // Intenta usar la interfaz nativa de Android si está disponible
            window.AndroidInterface.log('JS Cleaner: ' + message);
        } catch (e) {
            // Si falla, usa la consola del navegador como alternativa
            console.log('JS Cleaner (Fallback): ' + message);
        }
    }

    /**
     * Elimina un elemento del DOM de forma segura.
     * @param {string} selector - El selector CSS del elemento a eliminar.
     */
    function eliminarElemento(selector) {
        try {
            const elemento = document.querySelector(selector);
            if (elemento) {
                elemento.remove();
                nativeLog('Elemento eliminado: ' + selector);
            } else {
                nativeLog('WARN: No se encontró el elemento para eliminar: ' + selector);
            }
        } catch (error) {
            nativeLog('ERROR al eliminar "' + selector + '": ' + error.message);
        }
    }

    nativeLog('Iniciando limpieza de la interfaz...');

    // Lista de selectores de los elementos que se van a eliminar
    const selectoresAEliminar = [
        'div.page-title',
        '#kt_header',
        '#kt_footer',
        '#btnCerrar'
    ];

    // Recorre la lista y elimina cada elemento
    selectoresAEliminar.forEach(selector => {
        eliminarElemento(selector);
    });

    nativeLog('Limpieza de la interfaz completada.');

})();
