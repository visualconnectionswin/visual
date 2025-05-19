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

    // =========================================================================
    // == CONSTANTE IMPORTANTE: Pega aquí la URL de tu Web App de Google Apps Script ==
    // =========================================================================
    const APP_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzAb9QwsltGjAIBjzdxTr2BiJlwJ6JRWcz9XgWirsGRGhftygGgAXcqWaSy8bwD4VOf/exec'; 
    // Ejemplo: 'https://script.google.com/macros/s/AKfycby.../exec';
    // =========================================================================


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
                        if (lat !== 0 || lng !== 0) { // Considerar 0,0 como inválido si aplica
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
        
        let lastCheckedLat = null;
        let lastCheckedLng = null;
        let zonaFCheckInProgress = false;

        async function checkZonaF(lat, lng) {
            if (APP_SCRIPT_WEB_APP_URL === 'PEGA_AQUI_LA_URL_DE_TU_WEB_APP') {
                nativeLog('ERROR: URL de Web App no configurada.');
                updateZonaFStatusIndicator('ERROR_CONFIG');
                return;
            }
            
            // Evitar múltiples llamadas si ya hay una en progreso para las mismas coords
            // O si las coordenadas no han cambiado desde la última comprobación exitosa/fallida
            if (zonaFCheckInProgress && lat === lastCheckedLat && lng === lastCheckedLng) {
                nativeLog('Comprobación Zona F ya en progreso para estas coordenadas.');
                return;
            }
            if (!zonaFCheckInProgress && lat === lastCheckedLat && lng === lastCheckedLng) {
                // Si no está en progreso pero las coords son las mismas que la última vez,
                // podríamos asumir que el estado no ha cambiado, pero el requisito es "cada vez que aparezca"
                // por lo que procedemos, pero actualizamos que estamos comprobando.
                 nativeLog('Coords no cambiadas, pero se re-comprueba Zona F según requisito.');
            }


            zonaFCheckInProgress = true;
            lastCheckedLat = lat; // Actualizar antes de la llamada
            lastCheckedLng = lng;
            updateZonaFStatusIndicator('COMPROBANDO');
            nativeLog(`Comprobando Zona F para: ${lat}, ${lng}`);

            try {
                const response = await fetch(`${APP_SCRIPT_WEB_APP_URL}?lat=${lat}&lon=${lng}`);
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                const data = await response.json();
                nativeLog('Respuesta de Zona F: ' + JSON.stringify(data));
                updateZonaFStatusIndicator(data.status); // e.g., "DENTRO_ZONA_F", "FUERA_ZONA_F"
            } catch (error) {
                nativeLog('ERROR comprobando Zona F: ' + error.message);
                updateZonaFStatusIndicator('ERROR_API');
            } finally {
                zonaFCheckInProgress = false;
            }
        }

        function updateZonaFStatusIndicator(status) {
            const statusElement = document.getElementById('zonaFStatusIndicatorNativo');
            if (!statusElement) return;

            let text = 'Comprobando Zona F...';
            let color = '#808080'; // Gris
            let backgroundColor = '#f0f0f0'; // Gris claro para fondo

            switch (status) {
                case 'DENTRO_ZONA_F':
                    text = 'Dentro de Zona F';
                    color = '#ffffff'; // Blanco
                    backgroundColor = '#dc3545'; // Rojo
                    break;
                case 'FUERA_ZONA_F':
                    text = 'Fuera de Zona F';
                    color = '#ffffff'; // Blanco
                    backgroundColor = '#28a745'; // Verde
                    break;
                case 'ERROR_API':
                    text = 'Error al Comprobar';
                    color = '#ffffff';
                    backgroundColor = '#ffc107'; // Amarillo/Naranja advertencia
                    break;
                 case 'ERROR_CONFIG':
                    text = 'Error Configuración';
                    color = '#ffffff';
                    backgroundColor = '#6c757d'; // Gris oscuro
                    break;
                case 'COMPROBANDO':
                default:
                    text = 'Comprobando Zona F...';
                    color = '#333333'; // Texto oscuro para fondo claro
                    backgroundColor = '#e9ecef'; // Gris muy claro
                    break;
            }
            statusElement.textContent = text;
            statusElement.style.color = color;
            statusElement.style.backgroundColor = backgroundColor;
            statusElement.style.borderColor = backgroundColor; // Hacer el borde del mismo color o uno ligeramente más oscuro
        }


        function gestionarBotones() {
            const coords = obtenerCoordenadas();
            let container = document.querySelector('#contenedorBotonesNativos');
            
            if (!coords) {
                if (container) {
                    nativeLog('Sin coordenadas válidas, eliminando botones y status.');
                    container.remove();
                    // Resetear las últimas coordenadas comprobadas para forzar una nueva revisión
                    lastCheckedLat = null; 
                    lastCheckedLng = null;
                }
                return;
            }

            // Si las coordenadas son válidas, procedemos
            if (!container) {
                nativeLog('Creando contenedor de botones y status.');
                container = document.createElement('div');
                container.id = 'contenedorBotonesNativos';
                container.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 10px; /* Espacio entre el status y el botón */
                    margin-top: 15px;
                    margin-bottom: 10px;
                    padding: 5px;
                    border: 1px dashed #ccc;
                    border-radius: 4px;
                `;

                // 1. Crear el indicador de Zona F (a la izquierda)
                const zonaFStatusElement = document.createElement('span'); // Usar span para que sea inline-flex
                zonaFStatusElement.id = 'zonaFStatusIndicatorNativo';
                zonaFStatusElement.style.cssText = `
                    padding: 8px 12px;
                    border: 1px solid; /* El color del borde se manejará en updateZonaFStatusIndicator */
                    border-radius: 5px;
                    font-size: 13px;
                    font-weight: bold;
                    flex-shrink: 0; /* Para que no se encoja si el texto es largo */
                `;
                updateZonaFStatusIndicator('COMPROBANDO'); // Estado inicial
                container.appendChild(zonaFStatusElement);

                // 2. Crear el botón de Copiar Coordenadas (a la derecha)
                const botonCopiar = document.createElement('button');
                botonCopiar.id = 'botonCopiarCoordenadasNativo';
                botonCopiar.textContent = 'Copiar Coordenadas';
                botonCopiar.type = 'button';
                botonCopiar.style.cssText = `
                    padding: 8px 12px;
                    background-color: #007bff; /* Azul */
                    color: #fff;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 13px;
                    flex-shrink: 0;
                `;
                botonCopiar.addEventListener('click', function() {
                    const c = obtenerCoordenadas(); // Re-obtener por si acaso
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
                container.appendChild(botonCopiar);

                // Insertar el contenedor en el DOM
                const refElement = document.querySelector('#lgdir'); // Referencia para inserción
                const parentContainer = refElement ? refElement.closest('.mb-10') || refElement.parentNode.parentNode : null;
                if (parentContainer) {
                    parentContainer.parentNode.insertBefore(container, parentContainer.nextSibling);
                    nativeLog('Contenedor de botones y status insertado cerca de #lgdir.');
                } else {
                    const fallbackContainer = document.querySelector('#kt_modal_create_account .modal-body') || document.querySelector('.page_1.current .card-body') || document.body;
                    fallbackContainer.appendChild(container);
                    nativeLog('WARN: Contenedor de botones y status insertado en ubicación de fallback.');
                }
            }
            
            // Siempre que el contenedor de botones exista (y por ende, coords son válidas)
            // verificar la Zona F. La función checkZonaF tiene lógica para no repetir si no es necesario.
            // OJO: El requisito es "cada vez que aparezca", lo cual este setInterval ya lo cubre.
            // La lógica interna de checkZonaF evitará spam si las coords no cambian entre llamadas
            // pero si el botón "desaparece" y "reaparece" con las mismas coords, se volverá a llamar.
            if (coords.lat !== lastCheckedLat || coords.lng !== lastCheckedLng || !document.getElementById('zonaFStatusIndicatorNativo').textContent.includes('Zona F')) {
                 // Llama solo si las coordenadas cambiaron O si el texto actual no es uno final (ej. "Comprobando")
                 // Esto evita llamadas repetidas si el estado ya es "Dentro" o "Fuera" y las coords no cambian.
                checkZonaF(coords.lat, coords.lng);
            } else if (document.getElementById('zonaFStatusIndicatorNativo') && 
                       (document.getElementById('zonaFStatusIndicatorNativo').textContent.includes('Error') || 
                        document.getElementById('zonaFStatusIndicatorNativo').textContent.includes('Comprobando'))) {
                // Si el estado actual es de error o comprobando, intenta de nuevo aunque las coords no hayan cambiado
                checkZonaF(coords.lat, coords.lng);
            }
        }

        nativeLog('Iniciando monitorización de coordenadas/estado...');
        setInterval(gestionarBotones, 750); // Aumenté ligeramente el intervalo, 500ms es bastante agresivo para llamadas de red.

        // === INICIO: NUEVA FUNCIONALIDAD - MONITOREO PARA BOTÓN "REALIZAR SIMULACIÓN" ===
        // ... (Tu código existente para el botón de simulación se mantiene aquí sin cambios) ...
        const SIMULATION_BUTTON_ID = 'realizar-simulacion-btn';
        const SCORE_DISPLAY_SELECTOR = '#score_customer_div';
        const SCORE_CONTAINER_SELECTOR = '#score_customer_div';
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
            if (c) c.parentNode.insertBefore(b, c.nextSibling);
            nativeLog("Botón de simulación creado");
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
                if (/Score:\s*(?:20[1-9]|[2-9]\d{2})/.test(t)) {
                    createSimulationButton();
                    nativeLog("Score válido detectado: " + t.match(/Score:\s*(\d+)/)?.[1]);
                    return;
                }
            }
            removeSimulationButton();
        }

        nativeLog('Iniciando monitoreo para botón de simulación...');
        const scoreDisplay = document.querySelector(SCORE_DISPLAY_SELECTOR);
        if (scoreDisplay) {
            nativeLog('Elemento score encontrado, configurando observer');
            new MutationObserver(checkScoreAndToggleButton).observe(scoreDisplay, {
                childList: true,
                subtree: true,
                characterData: true
            });
            checkScoreAndToggleButton();
        } else {
            nativeLog('Elemento score no encontrado, programando chequeo periódico');
            const scoreCheckInterval = setInterval(() => {
                const scoreElement = document.querySelector(SCORE_DISPLAY_SELECTOR);
                if (scoreElement) {
                    clearInterval(scoreCheckInterval);
                    nativeLog('Elemento score encontrado posteriormente');
                    new MutationObserver(checkScoreAndToggleButton).observe(scoreElement, {
                        childList: true,
                        subtree: true,
                        characterData: true
                    });
                    checkScoreAndToggleButton();
                }
            }, 1000);
        }
        // === FIN: NUEVA FUNCIONALIDAD - BOTÓN "REALIZAR SIMULACIÓN" ===

    }, 1000); // Delay principal

    nativeLog('Script inyectado y ejecución iniciada.');
})();
