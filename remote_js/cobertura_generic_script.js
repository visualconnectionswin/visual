(function() {
    // Usar el log nativo para depurar el JS desde Android Studio
    function nativeLog(message) {
        try {
            window.AndroidInterface.log('Cobertura JS: ' + message);
        } catch(e) {
            console.log('Fallback Console (Cobertura JS): ' + message);
        }
    }

    nativeLog('Iniciando ejecución...');

    // !!! REEMPLAZA ESTA URL CON LA URL DE TU WEB APP DE APPS SCRIPT DESPLEGADA !!!
    // Asegúrate de que la URL termina en /exec
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAb9QwsltGjAIBjzdxTr2BiJlwJ6JRWcz9XgWirsGRGhftygGgAXcqWaSy8bwD4VOf/exec';

    let lastCheckedLatForZonaF = null;
    let lastCheckedLngForZonaF = null;

    // Function to update the Zona F status display element
    function updateZonaFStatus(text, color) {
        const statusElement = document.getElementById('zonaFStatusDisplayNativo'); // Get element by its ID
        if (statusElement) {
            statusElement.textContent = text;
            statusElement.style.backgroundColor = color;
            // Set text color for better contrast
             if (color === '#adb5bd' || color === 'gray') { // If background is light grey or similar (Comprobando)
                 statusElement.style.color = '#212529'; // Dark text
             } else { // For green or red backgrounds
                 statusElement.style.color = '#fff'; // White text
             }
             nativeLog(`Status Zona F actualizado: ${text} (${color})`);
        } else {
            nativeLog('WARN: Elemento de estado de Zona F no encontrado para actualizar.');
        }
    }


    // 1. Intentar hacer clic en el botón "Nuevo Lead"
    setTimeout(function() {
        const nuevoLeadButton = document.querySelector('#btnNuevoLead');
        if (nuevoLeadButton) {
            nativeLog('Clickeando #btnNuevoLead');
            nuevoLeadButton.click();
        } else {
            nativeLog('WARN: No se encontró #btnNuevoLead.');
        }
    }, 500);

    // Dar tiempo a que el modal o la sección aparezca
    setTimeout(function() {
        nativeLog('Ejecutando lógica principal después del delay...');

        // === INICIO: Insertar campo combinado "Lat, Lon" y llenarlo ===
        try {
            const lonElem = document.querySelector('#gf_lon');
            if (lonElem) {
                // Solo crear si no existe ya
                let combinedInput = document.querySelector('#gf_latlon');
                if (!combinedInput) {
                    combinedInput = document.createElement('input');
                    combinedInput.type = 'text';
                    combinedInput.placeholder = 'Lat, Lon';
                    combinedInput.className = 'gf_txt_50';
                    combinedInput.id = 'gf_latlon';
                    combinedInput.style.cssText = 'width:200px; margin-left:10px;';
                    lonElem.parentNode.insertBefore(combinedInput, lonElem.nextSibling);
                    nativeLog('Campo combinado gf_latlon añadido.');

                    combinedInput.addEventListener('input', function() {
                        const v = combinedInput.value.trim();
                        const parts = v.split(/[,;]+/);
                        if (parts.length >= 2) {
                            const lat = parts[0].trim();
                            const lon = parts[1].trim();
                            const latElem = document.querySelector('#gf_lat');
                            const lonElem2 = document.querySelector('#gf_lon');
                            if (latElem) latElem.value = lat;
                            if (lonElem2) lonElem2.value = lon;
                            nativeLog('Parsed lat: ' + lat + ' lon: ' + lon + ' desde gf_latlon');
                        }
                    });
                } else {
                     nativeLog('Campo combinado gf_latlon ya existe.');
                }
            } else {
                nativeLog('WARN: No se encontró el elemento #gf_lon para insertar/llenar gf_latlon.');
            }
        } catch(e) {
            nativeLog('ERROR añadiendo/llenando campo combinado (con coords): ' + e.message);
        }
        // === FIN: Insertar campo combinado ===

        // 2. Eliminar elementos estáticos no deseados
        const selectoresAEliminar = [
            '#kt_modal_create_account > div > div > div.modal-header',
            '#kt_header',
            '#kt_create_account_stepper > div.stepper-nav.py-5'
        ];
        selectoresAEliminar.forEach(selector => {
            try {
                const element = document.querySelector(selector);
                if (element) {
                    nativeLog('Eliminando elemento estático: ' + selector);
                    element.remove();
                }
            } catch (e) {
                nativeLog('ERROR eliminando selector estático: ' + selector + ' - ' + e.message);
            }
        });

        // 3. Lógica de obtención de coordenadas y creación de botones
        function obtenerCoordenadas() {
            try {
                const latInput = document.querySelector('#ltdir');
                const lngInput = document.querySelector('#lgdir');
                if (latInput && lngInput && latInput.value && lngInput.value) {
                    const lat = parseFloat(latInput.value);
                    const lng = parseFloat(lngInput.value);
                    if (!isNaN(lat) && !isNaN(lng)) {
                        if (lat !== 0 || lng !== 0) {
                            return { lat, lng };
                        } else {
                            nativeLog('WARN: Coordenadas (0,0) encontradas en inputs.');
                            return null;
                        }
                    } else {
                        nativeLog('WARN: Valores no numéricos en inputs de coordenadas.');
                    }
                }
            } catch (e) {
                nativeLog('ERROR obteniendo coordenadas: ' + e.message);
            }
            return null;
        }

        // Function to send coordinates to Apps Script for Zona F check (MODIFIED FOR POST)
        async function comprobarZonaF(coords) {
            // Re-get status element here
             const statusElement = document.getElementById('zonaFStatusDisplayNativo');
             if (!statusElement) {
                 nativeLog('ERROR: Elemento de estado Zona F no encontrado antes de la comprobación.');
                 return; // Cannot update status if element is missing
             }

            // Check for the placeholder URL or if it's empty
             if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') || GOOGLE_SCRIPT_URL.includes('TU_URL_DE_APPS_SCRIPT_AQUI_VA_AQUI')) {
                nativeLog('ERROR: La URL de Google Apps Script no está configurada correctamente.');
                updateZonaFStatus('Error Config URL', '#dc3545'); // Red
                return;
            }

            nativeLog(`Enviando coordenadas ${coords.lat}, ${coords.lng} a Apps Script para chequeo...`);
            updateZonaFStatus('Comprobando zona', '#adb5bd'); // Gris

            try {
                // --- MODIFICADO: Usar POST con cuerpo JSON ---
                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST', // Use POST method
                    mode: 'cors', // Include cors mode
                    headers: {
                        'Content-Type': 'application/json' // Specify content type
                    },
                    body: JSON.stringify({ lat: coords.lat, lon: coords.lng }) // Send lat/lon in JSON body (matches Apps Script doPost expectation)
                });

                // Check if response is OK (status in 200-299 range)
                if (!response.ok) {
                    // Log non-OK response status and possibly text
                    const errorBody = await response.text(); // Try to get response body for more info
                    nativeLog(`Error HTTP en respuesta de Apps Script: ${response.status} ${response.statusText}. Body: ${errorBody}`);
                    throw new Error(`Error HTTP! estado: ${response.status}`);
                }

                // Try to parse the response as JSON
                const data = await response.json();
                nativeLog('Respuesta JSON de Apps Script recibida: ' + JSON.stringify(data));

                // --- MODIFICADO: Verificar el formato de respuesta de doPost (status: "success", inZonaF: boolean) ---
                if (data.status === 'success') {
                    if (data.inZonaF === true) { // Check the boolean property
                        updateZonaFStatus('Dentro de Zona F', '#dc3545'); // Rojo
                        nativeLog(`Coordenadas ${coords.lat}, ${coords.lng} están DENTRO de Zona F.`);
                        lastCheckedLatForZonaF = coords.lat; // Only update last checked if successful
                        lastCheckedLngForZonaF = coords.lng;
                    } else if (data.inZonaF === false) { // Check the boolean property
                        updateZonaFStatus('Fuera de Zona F', '#28a745'); // Verde
                        nativeLog(`Coordenadas ${coords.lat}, ${coords.lng} están FUERA de Zona F.`);
                        lastCheckedLatForZonaF = coords.lat; // Only update last checked if successful
                        lastCheckedLngForZonaF = coords.lng;
                    } else {
                            // Should not happen if status is 'success' but inZonaF is missing/not boolean
                             nativeLog('Respuesta de Apps Script inesperada: status es success pero inZonaF falta o no es booleano. Data: ' + JSON.stringify(data));
                            updateZonaFStatus('Error Respuesta GS', '#dc3545'); // Rojo
                        }
                    } else if (data.status === 'error') {
                         // Handle error status from Apps Script logic (e.g., invalid input)
                         nativeLog('Error reportado por Apps Script: ' + data.message);
                        updateZonaFStatus('Error GS', '#dc3545'); // Rojo
                    }
                    else {
                        nativeLog('Respuesta de Apps Script con formato desconocido: ' + JSON.stringify(data));
                        updateZonaFStatus('Error Respuesta GS', '#dc3545'); // Rojo
                    }
                })
                .catch(error => {
                    // This catch block handles network errors or errors during response parsing (like invalid JSON)
                    nativeLog('Error en fetch o procesamiento de respuesta: ' + error.message);
                    updateZonaFStatus('Error Conexión/Procesamiento', '#dc3545'); // Rojo
                });
        }

        function gestionarBotones() {
            const coords = obtenerCoordenadas();
            let container = document.querySelector('#contenedorBotonesNativos');
            // Intentar obtener el elemento de estado de Zona F del DOM en cada ejecución
            let zonaFStatusElement = document.getElementById('zonaFStatusDisplayNativo'); // Get element by ID

            if (!coords) {
                // Si no hay coordenadas válidas, eliminar el contenedor si existe
                if (container) {
                    nativeLog('Sin coordenadas válidas, eliminando contenedor de botones y estado Zona F.');
                    container.remove(); // Esto eliminará también zonaFStatusElement si es hijo
                }
                // Si por alguna razón zonaFStatusElement existe fuera del container y no hay coords.
                // Esto es un caso borde, pero lo manejamos por robustez.
                if (zonaFStatusElement && !zonaFStatusElement.closest('#contenedorBotonesNativos')) {
                    nativeLog('Limpiando elemento de estado Zona F huérfano.');
                    zonaFStatusElement.remove();
                }
                // Reiniciar el estado de las últimas coordenadas chequeadas para forzar re-chequeo la próxima vez que aparezcan.
                lastCheckedLatForZonaF = null;
                lastCheckedLngForZonaF = null;
                return;
            }

            // Coordenadas válidas están presentes

            if (!container) {
                nativeLog('Creando contenedor de botones y estado Zona F.');
                container = document.createElement('div');
                container.id = 'contenedorBotonesNativos';
                container.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-top: 15px;
                    margin-bottom: 10px;
                    padding: 5px;
                    border: 1px dashed #ccc;
                    border-radius: 4px;
                `;

                // Crear elemento de estado Zona F (usamos <div> para mejor control de estilo si se desea)
                zonaFStatusElement = document.createElement('div'); // Re-declare for this scope
                zonaFStatusElement.id = 'zonaFStatusDisplayNativo';
                // Estilo inicial, se actualizará en comprobarZonaF
                zonaFStatusElement.style.cssText = `
                    padding: 8px 12px;
                    background-color: #adb5bd; /* Gris inicial */
                    color: #212529; /* Texto oscuro */
                    border: none;
                    border-radius: 5px;
                    font-size: 13px;
                    flex-shrink: 0;
                    text-align: center;
                    line-height: normal; /* Asegurar consistencia de altura */
                `;
                container.appendChild(zonaFStatusElement); // Añadir ANTES del botón de copiar

                const botonCopiar = document.createElement('button');
                botonCopiar.id = 'botonCopiarCoordenadasNativo';
                botonCopiar.textContent = 'Copiar Coordenadas';
                botonCopiar.type = 'button';
                botonCopiar.style.cssText = `
                    padding: 8px 12px;
                    background-color: #007bff;
                    color: #fff;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 13px;
                    flex-shrink: 0;
                `;
                botonCopiar.addEventListener('click', function() {
                    const c = obtenerCoordenadas();
                    if (c) {
                        const textoACopiar = c.lat + ',' + c.lng;
                        try {
                            window.AndroidInterface.copyCoordinates(textoACopiar);
                            nativeLog('Solicitando copia de: ' + textoACopiar);
                        } catch (e) {
                            nativeLog('ERROR llamando a copyCoordinates: ' + e.message);
                            alert('Error al intentar copiar.');
                        }
                    } else {
                        nativeLog('WARN: Intento de copiar sin coordenadas válidas.');
                        alert('No hay coordenadas válidas para copiar.');
                    }
                });
                container.appendChild(botonCopiar); // Add after status element

                // Insertar el contenedor en la página
                const refElement = document.querySelector('#lgdir');
                // Buscar un contenedor padre común o un lugar lógico para insertar
                const parentContainer = refElement ? refElement.closest('.mb-10') || refElement.parentNode.parentNode : null;

                if (parentContainer && parentContainer.parentNode) {
                    parentContainer.parentNode.insertBefore(container, parentContainer.nextSibling);
                    nativeLog('Contenedor de botones insertado cerca de #lgdir.');
                } else {
                    // Fallback: intentar añadirlo a un contenedor modal o al cuerpo
                    const fallbackContainer = document.querySelector('#kt_modal_create_account .modal-body') || document.querySelector('.page_1.current .card-body') || document.body;
                    if (fallbackContainer) {
                        fallbackContainer.appendChild(container);
                        nativeLog('WARN: Contenedor de botones insertado en ubicación de fallback.');
                    } else {
                        nativeLog('ERROR: No se pudo encontrar un lugar para insertar el contenedor de botones.');
                        return; // No podemos continuar si no se insertó el contenedor
                    }
                }
                
                // Después de crear e insertar, obtenemos la referencia final al elemento de estado
                zonaFStatusElement = document.getElementById('zonaFStatusDisplayNativo');

                // Disparar la comprobación inicial de Zona F
                if(zonaFStatusElement){
                     nativeLog('Disparando chequeo inicial de Zona F (creación de contenedor)...');
                     // comprobarZonaF ya actualiza el estado inicial a 'Comprobando zona'
                     comprobarZonaF(coords);
                     lastCheckedLatForZonaF = coords.lat; // Guardar coordenadas después del primer chequeo
                     lastCheckedLngForZonaF = coords.lng;
                } else {
                     nativeLog('ERROR: Elemento zonaFStatusDisplayNativo debería existir ahora, pero no se encontró.');
                }
                return; // Salir, la próxima ejecución de gestionarBotones manejará las actualizaciones o cambios.

            }
            
            // Si el contenedor ya existe, verificar si las coordenadas cambiaron y re-chequear
            // Asegurarse de que el elemento de estado también existe
            if (zonaFStatusElement && (coords.lat !== lastCheckedLatForZonaF || coords.lng !== lastCheckedLngForZonaF)) {
                nativeLog('Coordenadas para Zona F actualizadas (' + coords.lat + ',' + coords.lng + '). Re-verificando...');
                // La función comprobarZonaF se encarga de actualizar el texto a "Comprobando..."
                comprobarZonaF(coords);
                // lastCheckedCoords se actualiza dentro de comprobarZonaF solo si el fetch es exitoso
            } else if (zonaFStatusElement) {
                 // El contenedor y el elemento de estado existen, y las coordenadas no cambiaron. No se hace nada.
                // nativeLog('Coordenadas para Zona F (' + coords.lat + ',' + coords.lng + ') sin cambios. No se vuelve a verificar.'); // Demasiado ruidoso
            } else {
                 // El contenedor existe, pero el elemento de estado no. Esto es inesperado.
                 nativeLog('WARN: Contenedor existente pero elemento zonaFStatusDisplayNativo no encontrado. Intentando re-crear contenedor.');
                 container.remove(); // Forzar la re-creación en el próximo ciclo
                 // No salimos, dejamos que el setInterval lo intente de nuevo.
            }
        }

        nativeLog('Iniciando monitorización de coordenadas para gestionar botones y estado Zona F...');
        // El intervalo revisa periódicamente si hay coordenadas y gestiona la UI y el chequeo de Zona F
        setInterval(gestionarBotones, 500);

        // === INICIO: NUEVA FUNCIONALIDAD - MONITOREO PARA BOTÓN "REALIZAR SIMULACIÓN" ===
        const SIMULATION_BUTTON_ID = 'realizar-simulacion-btn';
        const SCORE_DISPLAY_SELECTOR = '#score_customer_div';
        const SCORE_CONTAINER_SELECTOR = '#score_customer_div'; // Asumo que es el mismo para insertar el botón después
        const VENDOR_NAME = "ZORIANYS MILAGROS LEAL";

        function handleSimulationClick() {
            nativeLog("Inicia simulación");
            const btn = document.getElementById(SIMULATION_BUTTON_ID);
            if (btn) btn.disabled = true;

            try {
                const ide = document.querySelector('#ide_cli');
                if (!ide.value) {
                    nativeLog("No hay ID cliente, haciendo click en nuevoCliente");
                    const nuevoClienteBtn = document.querySelector('#nuevoCliente');
                    if (nuevoClienteBtn) nuevoClienteBtn.click();

                    setTimeout(() => {
                        const cliTel = document.querySelector('#cli_tel1');
                        const cliEmail = document.querySelector('#cli_email');

                        if (cliTel) {
                            cliTel.value = '999999999';
                            cliTel.dispatchEvent(new Event('change', {bubbles: true}));
                            nativeLog("Teléfono completado");
                        }

                        if (cliEmail) {
                            cliEmail.value = 'demopruebadanna@gmail.com';
                            cliEmail.dispatchEvent(new Event('change', {bubbles: true}));
                            nativeLog("Email completado");
                        }

                        setTimeout(() => {
                            const addCustomerBtn = document.querySelector('#add_customer_data');
                            if (addCustomerBtn) {
                                addCustomerBtn.click();
                                nativeLog("Click en agregar cliente");
                            }
                        }, 100);
                    }, 300);
                } else {
                    nativeLog("ID cliente ya existe: " + ide.value);
                }

                setTimeout(() => {
                    const checkTratamiento = document.querySelector('#checkTratamientoDatos');
                    if (checkTratamiento && !checkTratamiento.checked) {
                        checkTratamiento.checked = true;
                        checkTratamiento.dispatchEvent(new Event('change', {bubbles: true}));
                        nativeLog("Check tratamiento datos activado");
                    }

                    const tipoServicio = document.querySelector('#tipo_servicio');
                    if (tipoServicio) {
                        tipoServicio.value = '1';
                        tipoServicio.dispatchEvent(new Event('change', {bubbles: true}));
                        nativeLog("Tipo servicio seleccionado");
                    }

                    const relacionPredio = document.querySelector('#relacionPredio');
                    if (relacionPredio) {
                        relacionPredio.value = '2';
                        relacionPredio.dispatchEvent(new Event('change', {bubbles: true}));
                        nativeLog("Relación predio seleccionada");
                    }

                    const tipoInteres = document.querySelector('#tipoInteres');
                    if (tipoInteres) {
                        const options = Array.from(tipoInteres.options);
                        const ventaOption = options.find(o => o.textContent.trim() === 'Venta');
                        if (ventaOption) {
                            tipoInteres.value = ventaOption.value;
                            tipoInteres.dispatchEvent(new Event('change', {bubbles: true}));
                            nativeLog("Tipo interés seleccionado: Venta");
                        }
                    }

                    const agencia = document.querySelector('#agencia');
                    if (agencia) {
                        const options = Array.from(agencia.options);
                        const agenciaOption = options.find(o => o.textContent.trim() === VENDOR_NAME);
                        if (agenciaOption) {
                            agencia.value = agenciaOption.value;
                            agencia.dispatchEvent(new Event('change', {bubbles: true}));
                            nativeLog("Agencia seleccionada: " + VENDOR_NAME);
                        }
                    }

                    setTimeout(() => {
                        const registerSearch = document.querySelector('#register_search');
                        if (registerSearch) {
                            registerSearch.click();
                            nativeLog("Click en register_search");

                            setTimeout(() => {
                                const swalConfirm = document.querySelector('button.swal2-confirm.swal2-styled');
                                if (swalConfirm) {
                                    swalConfirm.click();
                                    nativeLog("Click automático en Ok confirmación");
                                }

                                const btnAfter = document.getElementById(SIMULATION_BUTTON_ID);
                                if (btnAfter) btnAfter.disabled = false;
                                nativeLog("Simulación completa");
                            }, 1000);
                        }
                    }, 500);
                }, 1000);

            } catch (e) {
                nativeLog("ERROR en simulación: " + e.message);
                alert("Error en simulación, revisa consola");
                const btn2 = document.getElementById(SIMULATION_BUTTON_ID);
                if (btn2) btn2.disabled = false;
            }
        }

        function createSimulationButton() {
            if (document.getElementById(SIMULATION_BUTTON_ID)) return;
            const b = document.createElement('button');
            b.id = SIMULATION_BUTTON_ID;
            b.textContent = 'Realizar Simulación';
            b.className = 'btn btn-warning fw-bolder btn-warning-degradate';
            b.style.margin = '10px 0';
            b.addEventListener('click', handleSimulationClick);
            const c = document.querySelector(SCORE_CONTAINER_SELECTOR);
            if (c) {
                // Insertar después del contenedor de score, no dentro.
                c.parentNode.insertBefore(b, c.nextSibling);
                nativeLog("Botón de simulación creado después de " + SCORE_CONTAINER_SELECTOR);
            } else {
                nativeLog("WARN: Contenedor " + SCORE_CONTAINER_SELECTOR + " no encontrado para botón de simulación.");
                // Fallback: añadir al body o a un contenedor principal si es necesario
            }
        }

        function removeSimulationButton() {
            const b = document.getElementById(SIMULATION_BUTTON_ID);
            if (b) {
                b.remove();
                nativeLog("Botón de simulación eliminado");
            }
        }

        function checkScoreAndToggleButton() {
            const d = document.querySelector(SCORE_DISPLAY_SELECTOR);
            if (d && window.getComputedStyle(d).display !== 'none') {
                const t = d.textContent || '';
                if (/Score:\s*(?:20[1-9]|[2-9]\d{2}|\d{4,})/.test(t)) { // Modificado para aceptar scores >= 201
                    createSimulationButton();
                    nativeLog("Score válido detectado: " + t.match(/Score:\s*(\d+)/)?.[1]);
                    return;
                } else {
                    nativeLog("Score no válido o no visible: " + t);
                }
            } else {
                 // nativeLog("Elemento score no visible o no encontrado.");
            }
            removeSimulationButton();
        }

        nativeLog('Iniciando monitoreo para botón de simulación...');
        const scoreDisplay = document.querySelector(SCORE_DISPLAY_SELECTOR);
        if (scoreDisplay) {
            nativeLog('Elemento score encontrado, configurando observer');
            const observer = new MutationObserver(checkScoreAndToggleButton);
            observer.observe(scoreDisplay, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true, // Observar cambios de atributos como 'style' (display)
                attributeFilter: ['style']
            });
            // También observar cambios en el display del propio elemento scoreDisplay
             const displayObserver = new MutationObserver(checkScoreAndToggleButton);
             displayObserver.observe(scoreDisplay, { attributes: true, attributeFilter: ['style'] });

            checkScoreAndToggleButton(); // Chequeo inicial
        } else {
            nativeLog('Elemento score no encontrado, programando chequeo periódico');
            const scoreCheckInterval = setInterval(() => {
                const scoreElement = document.querySelector(SCORE_DISPLAY_SELECTOR);
                if (scoreElement) {
                    clearInterval(scoreCheckInterval);
                    nativeLog('Elemento score encontrado posteriormente');
                    const observer = new MutationObserver(checkScoreAndToggleButton);
                    observer.observe(scoreElement, {
                        childList: true,
                        subtree: true,
                        characterData: true,
                        attributes: true,
                        attributeFilter: ['style']
                    });
                     const displayObserver = new MutationObserver(checkScoreAndToggleButton);
                     displayObserver.observe(scoreElement, { attributes: true, attributeFilter: ['style'] });
                    checkScoreAndToggleButton();
                }
            }, 1000);
        }
        // === FIN: NUEVA FUNCIONALIDAD - BOTÓN "REALIZAR SIMULACIÓN" ===
    }, 1000); // Delay aumentado para asegurar que los elementos del DOM estén más probablemente cargados

    nativeLog('Script inyectado y ejecución iniciada.');
})();
