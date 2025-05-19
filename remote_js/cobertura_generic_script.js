(function() {
    // Usar el log nativo para depurar el JS desde Android Studio
    function nativeLog(message) {
        try {
            // Asegurarse de que el mensaje es una cadena
            const msgStr = (typeof message === 'object') ? JSON.stringify(message) : String(message);
            window.AndroidInterface.log('Cobertura JS: ' + msgStr);
        } catch(e) {
            const fallbackMsg = (typeof message === 'object') ? JSON.stringify(message) : String(message);
            console.log('Fallback Console (Cobertura JS): ' + fallbackMsg);
        }
    }

    nativeLog('Iniciando ejecución...');

    // =========================================================================
    // == CONSTANTE IMPORTANTE: Pega aquí la URL de tu Web App de Google Apps Script ==
    // =========================================================================
    const APP_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzAb9QwsltGjAIBjzdxTr2BiJlwJ6JRWcz9XgWirsGRGhftygGgAXcqWaSy8bwD4VOf/exec'; 
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
        
        let lastCheckedLat = null;
        let lastCheckedLng = null;
        let zonaFCheckInProgress = false;

        async function checkZonaF(lat, lng) {
            if (APP_SCRIPT_WEB_APP_URL === 'PEGA_AQUI_LA_URL_DE_TU_WEB_APP' || !APP_SCRIPT_WEB_APP_URL) {
                nativeLog('ERROR CRÍTICO: URL de Web App no configurada.');
                updateZonaFStatusIndicator('ERROR_CONFIG');
                return;
            }
            
            if (zonaFCheckInProgress) {
                nativeLog('Comprobación Zona F ya en progreso. Se omite esta llamada.');
                return;
            }

            zonaFCheckInProgress = true;
            lastCheckedLat = lat; // Actualizar aquí, antes de la llamada. Estas son las coords para las que se está INTENTANDO.
            lastCheckedLng = lng;
            updateZonaFStatusIndicator('COMPROBANDO');
            nativeLog(`Comprobando Zona F para: ${lat}, ${lng}`);

            try {
                const urlToFetch = `${APP_SCRIPT_WEB_APP_URL}?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
                nativeLog(`Intentando fetch a: ${urlToFetch}`);
                const response = await fetch(urlToFetch);
                nativeLog(`Respuesta recibida, status: ${response.status}, ok: ${response.ok}`);

                if (!response.ok) {
                    const errorText = await response.text(); 
                    nativeLog(`Error HTTP, cuerpo: ${errorText}`);
                    // Lanzar un error que incluya el status y el cuerpo para más info.
                    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
                }
                
                const responseText = await response.text();
                nativeLog(`Respuesta de Zona F (texto crudo): ${responseText}`);
                try {
                    const data = JSON.parse(responseText); 
                    nativeLog('Respuesta de Zona F (JSON parseado): ' + JSON.stringify(data));
                    if (data && data.status) {
                        updateZonaFStatusIndicator(data.status);
                    } else {
                        nativeLog('ERROR: Respuesta JSON no tiene propiedad status. Data: ' + JSON.stringify(data));
                        updateZonaFStatusIndicator('ERROR_API_FORMAT');
                    }
                } catch (parseError) {
                    nativeLog('ERROR parseando JSON de Zona F: ' + parseError.message + ". Respuesta original: " + responseText);
                    updateZonaFStatusIndicator('ERROR_API_FORMAT'); 
                }

            } catch (error) {
                // Asegurarse de que el error es una cadena para nativeLog
                const errorMessage = error.message ? error.message : String(error);
                const errorStack = error.stack ? `\nStack: ${error.stack}` : '';
                nativeLog('ERROR comprobando Zona F (catch general): ' + errorMessage + errorStack);
                updateZonaFStatusIndicator('ERROR_API');
            } finally {
                zonaFCheckInProgress = false;
            }
        }

        function updateZonaFStatusIndicator(status) {
            const statusElement = document.getElementById('zonaFStatusIndicatorNativo');
            if (!statusElement) return;

            let text = 'Comprobando Zona F...';
            let color = '#333333'; 
            let backgroundColor = '#e9ecef'; 

            switch (status) {
                case 'DENTRO_ZONA_F':
                    text = 'Dentro de Zona F';
                    color = '#ffffff'; 
                    backgroundColor = '#dc3545'; // Rojo
                    break;
                case 'FUERA_ZONA_F':
                    text = 'Fuera de Zona F';
                    color = '#ffffff'; 
                    backgroundColor = '#28a745'; // Verde
                    break;
                case 'ERROR_API':
                    text = 'Error al Comprobar';
                    color = '#ffffff';
                    backgroundColor = '#ffc107'; // Amarillo/Naranja advertencia
                    break;
                case 'ERROR_PARAMS': // Nuevo estado desde GS
                    text = 'Error en Coordenadas';
                    color = '#ffffff';
                    backgroundColor = '#6c757d'; // Gris oscuro
                    break;
                case 'ERROR_SERVER': // Nuevo estado desde GS
                    text = 'Error Servidor';
                    color = '#ffffff';
                    backgroundColor = '#6c757d'; // Gris oscuro
                    break;
                case 'ERROR_CONFIG':
                    text = 'Error Configuración URL';
                    color = '#ffffff';
                    backgroundColor = '#17a2b8'; // Cyan para error de config
                    break;
                case 'ERROR_API_FORMAT':
                    text = 'Error Formato Resp.';
                    color = '#ffffff';
                    backgroundColor = '#6f42c1'; // Púrpura
                    break;
                case 'COMPROBANDO':
                default:
                    // Valores por defecto ya establecidos
                    break;
            }
            statusElement.textContent = text;
            statusElement.style.color = color;
            statusElement.style.backgroundColor = backgroundColor;
            statusElement.style.borderColor = backgroundColor; 
        }

        function gestionarBotones() {
            const coords = obtenerCoordenadas();
            let container = document.querySelector('#contenedorBotonesNativos');
            
            if (!coords) {
                if (container) {
                    nativeLog('Sin coordenadas válidas, eliminando botones y status.');
                    container.remove();
                    lastCheckedLat = null; 
                    lastCheckedLng = null;
                    zonaFCheckInProgress = false; // Asegurarse de resetear esto también
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
                    gap: 10px;
                    margin-top: 15px;
                    margin-bottom: 10px;
                    padding: 5px;
                    border: 1px dashed #ccc;
                    border-radius: 4px;
                `;

                const zonaFStatusElement = document.createElement('span');
                zonaFStatusElement.id = 'zonaFStatusIndicatorNativo';
                zonaFStatusElement.style.cssText = `
                    padding: 8px 12px;
                    border: 1px solid; 
                    border-radius: 5px;
                    font-size: 13px;
                    font-weight: bold;
                    flex-shrink: 0;
                `;
                container.appendChild(zonaFStatusElement); // Añadir antes de llamar a update para que exista

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
                container.appendChild(botonCopiar);

                const refElement = document.querySelector('#lgdir');
                const parentContainer = refElement ? refElement.closest('.mb-10') || refElement.parentNode.parentNode : null;
                if (parentContainer) {
                    parentContainer.parentNode.insertBefore(container, parentContainer.nextSibling);
                    nativeLog('Contenedor de botones y status insertado cerca de #lgdir.');
                } else {
                    const fallbackContainer = document.querySelector('#kt_modal_create_account .modal-body') || document.querySelector('.page_1.current .card-body') || document.body;
                    fallbackContainer.appendChild(container);
                    nativeLog('WARN: Contenedor de botones y status insertado en ubicación de fallback.');
                }
                // Después de crear el contenedor y el status element, iniciar la comprobación
                checkZonaF(coords.lat, coords.lng); 
            } else {
                // El contenedor ya existe. Comprobar si las coordenadas cambiaron.
                if ((coords.lat !== lastCheckedLat || coords.lng !== lastCheckedLng) && !zonaFCheckInProgress) {
                    nativeLog('Coordenadas cambiaron o es un nuevo intento. Re-comprobando Zona F.');
                    checkZonaF(coords.lat, coords.lng);
                } else if (!zonaFCheckInProgress) {
                    // Coords no cambiaron, no hay check en progreso.
                    // nativeLog('Mismas coordenadas, no hay check en progreso. No se re-comprueba automáticamente.');
                }
            }
        }

        nativeLog('Iniciando monitorización de coordenadas/estado...');
        setInterval(gestionarBotones, 750);

        // === INICIO: CÓDIGO SIMULACIÓN (SIN CAMBIOS, ASUMO QUE ESTÁ BIEN) ===
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
                if (/Score:\s*(?:20[1-9]|[2-9]\d{2})/.test(t)) { // Score > 200
                    createSimulationButton();
                    nativeLog("Score válido detectado: " + (t.match(/Score:\s*(\d+)/)?.[1] || "N/A"));
                    return;
                }
            }
            removeSimulationButton();
        }

        nativeLog('Iniciando monitoreo para botón de simulación...');
        const scoreDisplay = document.querySelector(SCORE_DISPLAY_SELECTOR);
        if (scoreDisplay) {
            nativeLog('Elemento score encontrado, configurando observer');
            const observer = new MutationObserver(checkScoreAndToggleButton);
            observer.observe(scoreDisplay, { childList: true, subtree: true, characterData: true });
            checkScoreAndToggleButton(); // Chequeo inicial
        } else {
            nativeLog('Elemento score no encontrado, programando chequeo periódico');
            const scoreCheckInterval = setInterval(() => {
                const scoreElement = document.querySelector(SCORE_DISPLAY_SELECTOR);
                if (scoreElement) {
                    clearInterval(scoreCheckInterval);
                    nativeLog('Elemento score encontrado posteriormente');
                    const observer = new MutationObserver(checkScoreAndToggleButton);
                    observer.observe(scoreElement, { childList: true, subtree: true, characterData: true });
                    checkScoreAndToggleButton(); // Chequeo inicial
                }
            }, 1000);
        }
        // === FIN: CÓDIGO SIMULACIÓN ===

    }, 1000); // Delay principal

    nativeLog('Script inyectado y ejecución iniciada.');
})();
