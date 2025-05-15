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

    // --- INICIO: Lógica de Zona F ---
    let ZONA_F_POLYGONS = null;
    let zonaFPolygonsLoadingPromise = null;

    function loadZonaFPolygons() {
        if (zonaFPolygonsLoadingPromise) {
            return zonaFPolygonsLoadingPromise;
        }
        zonaFPolygonsLoadingPromise = new Promise((resolve, reject) => {
            if (ZONA_F_POLYGONS) {
                nativeLog('Zona F polygons already available.');
                resolve(ZONA_F_POLYGONS);
                return;
            }
            nativeLog('Attempting to load Zona F polygons from file:///android_asset/default_zona_f.js...');
            const script = document.createElement('script');
            script.src = 'file:///android_asset/default_zona_f.js'; // Ruta estándar para assets en WebView
            script.onload = function() {
                if (typeof ZONA_F_POLYGONS_DATA !== 'undefined') {
                    ZONA_F_POLYGONS = ZONA_F_POLYGONS_DATA;
                    nativeLog('Zona F polygons loaded successfully. Count: ' + (ZONA_F_POLYGONS ? ZONA_F_POLYGONS.length : 0));
                    resolve(ZONA_F_POLYGONS);
                } else {
                    nativeLog('ERROR: ZONA_F_POLYGONS_DATA not found after loading default_zona_f.js. Asegúrate que el archivo define esta variable.');
                    ZONA_F_POLYGONS = []; // Evitar errores futuros, tratar como si no hubiera zonas F
                    reject('ZONA_F_POLYGONS_DATA not defined.');
                }
            };
            script.onerror = function() {
                nativeLog('ERROR: Failed to load default_zona_f.js.');
                ZONA_F_POLYGONS = []; // Evitar errores futuros
                reject('Failed to load default_zona_f.js');
            };
            document.head.appendChild(script);
        });
        return zonaFPolygonsLoadingPromise;
    }

    // Algoritmo Ray Casting para determinar si un punto está en un polígono
    function isPointInPolygon(point, polygon) {
        const x = point[0], y = point[1];
        let isInside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];

            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) isInside = !isInside;
        }
        return isInside;
    }

    async function checkZonaFStatus(longitude, latitude) {
        if (!ZONA_F_POLYGONS) {
            nativeLog('Zona F polygons not yet loaded for check, attempting to load first.');
            try {
                await loadZonaFPolygons();
            } catch (error) {
                nativeLog('Error loading Zona F polygons during check: ' + error);
                return { text: "Error Zona F", color: "grey", shortText: "Err" };
            }
        }

        if (!ZONA_F_POLYGONS || ZONA_F_POLYGONS.length === 0) {
            nativeLog('No Zona F polygons defined or available after load attempt.');
            return { text: "Fuera de Zona F (No hay datos de zona)", color: "green", shortText: "Ok" };
        }

        const currentPoint = [longitude, latitude];
        for (let i = 0; i < ZONA_F_POLYGONS.length; i++) {
            if (isPointInPolygon(currentPoint, ZONA_F_POLYGONS[i])) {
                nativeLog(`Punto (${longitude}, ${latitude}) ESTÁ DENTRO del polígono F #${i}`);
                return { text: "Dentro de Zona F", color: "red", shortText: "F!" };
            }
        }
        nativeLog(`Punto (${longitude}, ${latitude}) está FUERA de todas las zonas F.`);
        return { text: "Fuera de Zona F", color: "green", shortText: "Ok" };
    }
    // Carga inicial de polígonos (no bloqueante)
    loadZonaFPolygons().catch(err => nativeLog("Initial Zona F polygon load failed: " + err));
    // --- FIN: Lógica de Zona F ---


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

        function gestionarBotones() {
            const coords = obtenerCoordenadas();
            let container = document.querySelector('#contenedorBotonesNativos');

            if (!coords) {
                if (container) {
                    nativeLog('Sin coordenadas válidas, eliminando contenedor de botones.');
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

                // --- INICIO: Crear indicador Zona F ---
                const zonaFIndicator = document.createElement('div');
                zonaFIndicator.id = 'zonaFStatusIndicator';
                zonaFIndicator.style.cssText = `
                    width: 24px; height: 24px; border-radius: 50%;
                    background-color: grey;
                    margin-right: 5px; /* Ajustado para mejor espaciado */
                    display: flex; align-items: center; justify-content: center;
                    font-size: 10px; color: white; font-weight: bold;
                    border: 1px solid #555;
                    flex-shrink: 0; /* Para que no se encoja */
                    box-sizing: border-box; /* Importante para que padding/border no aumenten el tamaño */
                `;
                zonaFIndicator.textContent = '?';
                zonaFIndicator.title = 'Estado Zona F no verificado';
                container.appendChild(zonaFIndicator); // Añadir primero el indicador
                nativeLog('Indicador Zona F creado y añadido al contenedor.');
                // --- FIN: Crear indicador Zona F ---

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
                container.appendChild(botonCopiar); // Añadir el botón después del indicador

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

            // --- INICIO: Actualizar Indicador Zona F ---
            const zonaFIndicator = document.getElementById('zonaFStatusIndicator');
            if (zonaFIndicator) {
                zonaFIndicator.textContent = '...'; // Estado "comprobando"
                zonaFIndicator.style.backgroundColor = 'orange';
                zonaFIndicator.title = 'Comprobando Zona F...';
                nativeLog(`Comprobando Zona F para lng: ${coords.lng}, lat: ${coords.lat}`);

                checkZonaFStatus(coords.lng, coords.lat).then(status => {
                    const currentIndicator = document.getElementById('zonaFStatusIndicator');
                    // Comprobar si el indicador aún existe, ya que la lógica es asíncrona
                    if (currentIndicator) {
                        currentIndicator.textContent = status.shortText;
                        currentIndicator.style.backgroundColor = status.color;
                        currentIndicator.title = status.text;
                        nativeLog(`Indicador Zona F actualizado: ${status.text}`);
                    } else {
                        nativeLog('Indicador Zona F no encontrado para actualizar (probablemente eliminado).');
                    }
                }).catch(error => {
                    nativeLog('Error actualizando indicador Zona F: ' + error);
                    const currentIndicator = document.getElementById('zonaFStatusIndicator');
                    if (currentIndicator) {
                        currentIndicator.textContent = 'Err';
                        currentIndicator.style.backgroundColor = 'grey';
                        currentIndicator.title = 'Error al comprobar Zona F';
                    }
                });
            }
            // --- FIN: Actualizar Indicador Zona F ---
        }


        nativeLog('Iniciando monitorización de coordenadas/estado...');
        setInterval(gestionarBotones, 700); // Aumentado ligeramente por la llamada async

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

                    // Tipo de contacto: usar Select2 para "Venta"
                    const tipoInteres = document.querySelector('#tipoInteres');
                    if (tipoInteres) {
                        // Buscar opción "Venta"
                        const options = Array.from(tipoInteres.options);
                        const ventaOption = options.find(o => o.textContent.trim() === 'Venta');
                        if (ventaOption) {
                            tipoInteres.value = ventaOption.value;
                            tipoInteres.dispatchEvent(new Event('change', {bubbles: true}));
                            nativeLog("Tipo interés seleccionado: Venta");
                        }
                    }

                    // Seleccionar agencia
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

                    // Click en Register Search
                    setTimeout(() => {
                        const registerSearch = document.querySelector('#register_search');
                        if (registerSearch) {
                            registerSearch.click();
                            nativeLog("Click en register_search");

                            // Confirmación automática
                            setTimeout(() => {
                                const swalConfirm = document.querySelector('button.swal2-confirm.swal2-styled');
                                if (swalConfirm) {
                                    swalConfirm.click();
                                    nativeLog("Click automático en Ok confirmación");
                                }

                                // Habilitar botón de nuevo
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
                if (/Score:\s*(?:20[1-9]|[2-9]\d{2})/.test(t)) { // Score >= 201
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
    }, 1000);

    nativeLog('Script inyectado y ejecución iniciada.');
})();
