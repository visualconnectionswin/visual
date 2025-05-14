(function() {
    // Usar el log nativo para depurar el JS desde Android Studio
    function nativeLog(message) {
        try {
            window.AndroidInterface.log('Cobertura JS (Coords): ' + message);
        } catch(e) {
            console.log('Fallback Console (Coords): ' + message);
        }
    }

    // Inyecta los valores de Kotlin
    const kotlinCoords = "%KOTLIN_COORDS_PLACEHOLDER%";
    const kotlinTimestamp = %KOTLIN_TIMESTAMP_PLACEHOLDER%;

    nativeLog('Iniciando ejecución CON COORDENADAS: ' + kotlinCoords + ', timestamp: ' + kotlinTimestamp);

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

    // Dar tiempo a que el modal o la sección aparezca después del clic
    setTimeout(function() {
        nativeLog('Ejecutando lógica principal CON COORDENADAS después del delay...');

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

                // Llenar el campo combinado con las coordenadas de Kotlin
                combinedInput.value = kotlinCoords;
                nativeLog('Valor de gf_latlon establecido a: ' + kotlinCoords);

                // Disparar evento input si hay valor
                if (kotlinCoords !== "") {
                    const inputEvent = new Event('input', { bubbles: true });
                    combinedInput.dispatchEvent(inputEvent);
                    nativeLog('Evento input disparado para gf_latlon.');
                }

                // Llenar también los campos #gf_lat y #gf_lon si existen
                if (kotlinCoords !== "") {
                    const parts = kotlinCoords.split(/[,;]+/);
                    if (parts.length >= 2) {
                        const lat = parts[0].trim();
                        const lon = parts[1].trim();
                        const latElem = document.querySelector('#gf_lat');
                        const lonElem2 = document.querySelector('#gf_lon');

                        if (latElem) {
                            latElem.value = lat;
                            latElem.dispatchEvent(new Event('input', { bubbles: true }));
                            latElem.dispatchEvent(new Event('change', { bubbles: true }));
                            nativeLog('Inyectado valor lat: ' + lat + ' en campo #gf_lat');
                        } else {
                            nativeLog('WARN: No se encontró elemento #gf_lat para inyectar valor');
                        }

                        if (lonElem2) {
                            lonElem2.value = lon;
                            lonElem2.dispatchEvent(new Event('input', { bubbles: true }));
                            lonElem2.dispatchEvent(new Event('change', { bubbles: true }));
                            nativeLog('Inyectado valor lon: ' + lon + ' en campo #gf_lon');
                        } else {
                            nativeLog('WARN: No se encontró elemento #gf_lon para inyectar valor');
                        }
                    }
                }
            } else {
                nativeLog('WARN: No se encontró el elemento #gf_lon para insertar/llenar gf_latlon.');
            }
        } catch(e) {
            nativeLog('ERROR añadiendo/llenando campo combinado (con coords): ' + e.message);
        }
        // === FIN: Insertar campo combinado ===

        // 2. Eliminar elementos estáticos no deseados (si aún es necesario)
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

        function gestionarBotones() {
            const coords = obtenerCoordenadas();
            let container = document.querySelector('#contenedorBotonesNativos');
            if (!coords) {
                if (container) {
                    nativeLog('Sin coordenadas válidas en inputs, eliminando botones.');
                    container.remove();
                }
                return;
            }
            if (!container) {
                nativeLog('Creando contenedor de botones.');
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
                    nativeLog('Contenedor de botones insertado cerca de #lgdir.');
                } else {
                    const fallbackContainer = document.querySelector('#kt_modal_create_account .modal-body') || document.querySelector('.page_1.current .card-body') || document.body;
                    fallbackContainer.appendChild(container);
                    nativeLog('WARN: Contenedor de botones insertado en ubicación de fallback.');
                }
            }
        }

        nativeLog('Iniciando monitorización CON COORDENADAS de coordenadas/estado...');
        setInterval(gestionarBotones, 500);
        
        // === INICIO: NUEVA FUNCIONALIDAD - MONITOREO PARA BOTÓN "REALIZAR SIMULACIÓN" ===
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
                
                // Este setTimeout se ejecuta después del bloque if/else de ide.value
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
                        } else {
                            nativeLog("WARN: Opción 'Venta' no encontrada en #tipoInteres");
                        }
                    } else {
                        nativeLog("WARN: Elemento #tipoInteres no encontrado");
                    }
                    
                    const agencia = document.querySelector('#agencia');
                    if (agencia) {
                        const options = Array.from(agencia.options);
                        const agenciaOption = options.find(o => o.textContent.trim() === VENDOR_NAME);
                        if (agenciaOption) {
                            agencia.value = agenciaOption.value;
                            agencia.dispatchEvent(new Event('change', {bubbles: true}));
                            nativeLog("Agencia seleccionada: " + VENDOR_NAME);
                        } else {
                            nativeLog("WARN: Opción de agencia '" + VENDOR_NAME + "' no encontrada en #agencia");
                        }
                    } else {
                         nativeLog("WARN: Elemento #agencia no encontrado");
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
                                } else {
                                    nativeLog("WARN: Botón de confirmación Swal no encontrado");
                                }
                                
                                const btnAfter = document.getElementById(SIMULATION_BUTTON_ID);
                                if (btnAfter) btnAfter.disabled = false;
                                nativeLog("Simulación completa");
                            }, 1000); // Espera para el Swal
                        } else {
                            nativeLog("WARN: Botón #register_search no encontrado");
                            const btnAfter = document.getElementById(SIMULATION_BUTTON_ID);
                            if (btnAfter) btnAfter.disabled = false; // Habilitar si register_search no se encuentra
                        }
                    }, 500); // Espera para register_search
                }, 1000); // Espera para completar campos después de creación de cliente o si ya existía
                
            } catch (e) {
                nativeLog("ERROR en simulación: " + e.message + (e.stack ? " Stack: " + e.stack : ""));
                alert("Error en simulación, revisa consola nativa para detalles.");
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
                c.parentNode.insertBefore(b, c.nextSibling);
                nativeLog("Botón de simulación creado");
            } else {
                nativeLog("WARN: Contenedor de score no encontrado para insertar botón de simulación.");
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
                if (/Score:\s*(?:20[1-9]|[2-9]\d{2})/.test(t)) { 
                    createSimulationButton(); 
                    nativeLog("Score válido detectado: " + t.match(/Score:\s*(\d+)/)?.[1]);
                    return; 
                } else {
                    nativeLog("Score no válido o no visible: " + t);
                }
            } else {
                nativeLog("Elemento score_customer_div no encontrado o no visible.");
            }
            removeSimulationButton();
        }

        nativeLog('Iniciando monitoreo CON COORDENADAS para botón de simulación...');
        // Intentar encontrar el elemento score_customer_div inmediatamente
        const scoreDisplayInitial = document.querySelector(SCORE_DISPLAY_SELECTOR);
        if (scoreDisplayInitial) {
            nativeLog('Elemento score encontrado, configurando observer');
            new MutationObserver(checkScoreAndToggleButton).observe(scoreDisplayInitial, {
                childList: true, 
                subtree: true,
                characterData: true
            });
            checkScoreAndToggleButton(); // Chequeo inicial
        } else {
            nativeLog('Elemento score no encontrado inicialmente, programando chequeo periódico...');
            let attempts = 0;
            const maxAttempts = 20; // Intentar por 10 segundos (20 * 500ms)
            const scoreCheckInterval = setInterval(() => {
                const scoreElement = document.querySelector(SCORE_DISPLAY_SELECTOR);
                if (scoreElement) {
                    clearInterval(scoreCheckInterval);
                    nativeLog('Elemento score encontrado posteriormente, configurando observer.');
                    new MutationObserver(checkScoreAndToggleButton).observe(scoreElement, {
                        childList: true, 
                        subtree: true,
                        characterData: true
                    });
                    checkScoreAndToggleButton(); // Chequeo inicial una vez encontrado
                } else {
                    attempts++;
                    nativeLog('Intento ' + attempts + ' de ' + maxAttempts + ' para encontrar ' + SCORE_DISPLAY_SELECTOR);
                    if (attempts >= maxAttempts) {
                        clearInterval(scoreCheckInterval);
                        nativeLog('WARN: No se pudo encontrar ' + SCORE_DISPLAY_SELECTOR + ' después de ' + maxAttempts + ' intentos.');
                    }
                }
            }, 500); // Chequear cada 500ms
        }
        // === FIN: NUEVA FUNCIONALIDAD - BOTÓN "REALIZAR SIMULACIÓN" ===

        // Listener para auto-selección de tipo de documento
        const inputDoc = document.querySelector('#documento\_identidad'); // Renombrado para evitar conflicto con 'input' global si existiera
        const selectDoc = document.querySelector('#tipo\_doc'); // Renombrado para evitar conflicto con 'select' global si existiera
        if (inputDoc && selectDoc) {
            nativeLog('Configurando listener para auto-selección de tipo de documento.');
            inputDoc.addEventListener('input', () => {
                inputDoc.value = inputDoc.value.replace(/\s+/g, '');
                inputDoc.value = inputDoc.value.replace(/[^0-9]/g, ''); // Corregido: [^0-9] para solo números
                const length = inputDoc.value.length;
                let eventDispatched = false;
                if (length === 8) {
                    if (selectDoc.value !== '1') {
                        selectDoc.value = '1'; // DNI
                        selectDoc.dispatchEvent(new Event('change', { bubbles: true }));
                        nativeLog('Tipo Documento cambiado a DNI (1) por longitud 8.');
                        eventDispatched = true;
                    }
                } else if (length === 9) {
                     if (selectDoc.value !== '3') {
                        selectDoc.value = '3'; // CE
                        selectDoc.dispatchEvent(new Event('change', { bubbles: true }));
                        nativeLog('Tipo Documento cambiado a CE (3) por longitud 9.');
                        eventDispatched = true;
                    }
                } else if (length === 11) {
                    if (selectDoc.value !== '6') {
                        selectDoc.value = '6'; // RUC
                        selectDoc.dispatchEvent(new Event('change', { bubbles: true }));
                        nativeLog('Tipo Documento cambiado a RUC (6) por longitud 11.');
                        eventDispatched = true;
                    }
                }
                if (length > 11) {
                    inputDoc.value = inputDoc.value.slice(0, 11);
                    nativeLog('Longitud de documento recortada a 11.');
                }
            });
        } else {
            nativeLog('WARN: No se encontraron #documento_identidad o #tipo_doc para auto-selección.');
        }


    }, 1000); // Fin del setTimeout de la lógica principal

    // Secuencia de clicks adicionales (originalmente en tu jsWithCoords)
    setTimeout(function() {
        nativeLog('Iniciando secuencia de clicks adicionales (Coords)...');
        function waitForElement(selector, callback, maxAttempts = 20, interval = 500) { 
            let attempts = 0; 
            function tryFind() { 
                const element = document.querySelector(selector); 
                // Asegurarse que el elemento está visible y en el DOM
                if (element && element.offsetParent !== null && window.getComputedStyle(element).display !== 'none' && window.getComputedStyle(element).visibility !== 'hidden') { 
                    nativeLog('Elemento encontrado y visible: ' + selector); 
                    callback(element); 
                } else { 
                    attempts++; 
                    if (attempts < maxAttempts) { 
                        nativeLog('Esperando por elemento: ' + selector + ' (intento ' + attempts + ')'); 
                        setTimeout(tryFind, interval); 
                    } else { 
                        nativeLog('ERROR: Elemento no encontrado o no visible después de ' + maxAttempts + ' intentos: ' + selector); 
                    } 
                } 
            } 
            tryFind(); 
        }
        waitForElement('img[src*="geolocalizacion_icon.png"]', function(geoIcon) { 
            nativeLog('Clickeando en ícono de geolocalización'); 
            geoIcon.click(); 
            waitForElement('input.gf_btnPopup[value="Confirmar"]', function(confirmButton) { 
                nativeLog('Clickeando en botón Confirmar'); 
                confirmButton.click(); 
                waitForElement('#continuar', function(continuarButton) { 
                    nativeLog('Clickeando en botón Continuar'); 
                    continuarButton.click(); 
                    nativeLog('Secuencia de clicks (coords) completada exitosamente'); 
                }); 
            }); 
        });
    }, 1500); // Este timeout se ejecuta después del principal para no interferir

    nativeLog('Script CON COORDENADAS inyectado y ejecución iniciada.');
})();
