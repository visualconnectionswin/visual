(function() {
    // Usar el log nativo para depurar el JS desde Android Studio
    function nativeLog(message) {
        try {
            window.AndroidInterface.log('Cobertura JS: ' + message);
        } catch(e) {
            console.log('Fallback Console (Cobertura JS): ' + message);
        }
    }

    nativeLog('Iniciando ejecución del script principal de Cobertura...');

    // --- INICIO: Utilidad para mensajes en página sobre carga de Zona F ---
    let zonaFLoadStatusDiv = null;
    function ensureZonaFLoadStatusDiv() {
        if (document.getElementById('zonaFLoadStatusMessage')) {
            zonaFLoadStatusDiv = document.getElementById('zonaFLoadStatusMessage');
            return;
        }
        zonaFLoadStatusDiv = document.createElement('div');
        zonaFLoadStatusDiv.id = 'zonaFLoadStatusMessage';
        zonaFLoadStatusDiv.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 10px;
            font-size: 13px;
            color: #212529;
            z-index: 20000;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            max-width: calc(100% - 20px);
            box-sizing: border-box;
            opacity: 0.95;
            transition: opacity 0.5s;
        `;
        
        const appendToBody = () => {
            if(document.body) {
                document.body.appendChild(zonaFLoadStatusDiv);
            } else {
                setTimeout(appendToBody, 100);
            }
        };
        appendToBody();
    }

    function updateZonaFLoadStatusMessage(message, type = 'info') { 
        ensureZonaFLoadStatusDiv(); 
        if (zonaFLoadStatusDiv) {
            zonaFLoadStatusDiv.textContent = message;
            zonaFLoadStatusDiv.style.opacity = '0.95'; 
            switch(type) {
                case 'success':
                    zonaFLoadStatusDiv.style.color = '#155724';
                    zonaFLoadStatusDiv.style.backgroundColor = '#d4edda';
                    zonaFLoadStatusDiv.style.borderColor = '#c3e6cb';
                    break;
                case 'error':
                    zonaFLoadStatusDiv.style.color = '#721c24';
                    zonaFLoadStatusDiv.style.backgroundColor = '#f8d7da';
                    zonaFLoadStatusDiv.style.borderColor = '#f5c6cb';
                    break;
                case 'info':
                default:
                    zonaFLoadStatusDiv.style.color = '#004085';
                    zonaFLoadStatusDiv.style.backgroundColor = '#cce5ff';
                    zonaFLoadStatusDiv.style.borderColor = '#b8daff';
                    break;
            }
        }
        nativeLog('Zona F Info (desde script principal): ' + message);
    }
    // --- FIN: Utilidad para mensajes en página sobre carga de Zona F ---


    // --- INICIO: Lógica de Zona F ---
    let ZONA_F_POLYGONS = null; 

    if (typeof ZONA_F_POLYGONS_DATA !== 'undefined' && Array.isArray(ZONA_F_POLYGONS_DATA)) {
        ZONA_F_POLYGONS = ZONA_F_POLYGONS_DATA;
        nativeLog('Datos de Zona F (ZONA_F_POLYGONS_DATA) encontrados y asignados. Cantidad: ' + ZONA_F_POLYGONS.length);
        if (ZONA_F_POLYGONS.length > 0) {
            updateZonaFLoadStatusMessage(`Datos de Zona F listos (${ZONA_F_POLYGONS.length} polígonos).`, 'success');
        } else {
            updateZonaFLoadStatusMessage('Datos de Zona F están vacíos (ZONA_F_POLYGONS_DATA existe pero sin polígonos).', 'info');
        }
    } else {
        nativeLog('ERROR CRÍTICO: ZONA_F_POLYGONS_DATA no está definida o no es un array. La funcionalidad de Zona F no operará. Esto puede ocurrir si el script zona_f_data_script.js no se cargó o está vacío.');
        updateZonaFLoadStatusMessage('Error: No se pudieron cargar los datos de Zona F. La variable ZONA_F_POLYGONS_DATA no se encontró o es inválida.', 'error');
        ZONA_F_POLYGONS = []; 
    }

    // Algoritmo Ray Casting MODIFICADO para ser más robusto (evitar división por cero)
    function isPointInPolygon(point, polygon) {
        if (!point || !Array.isArray(point) || point.length !== 2 || !polygon || !Array.isArray(polygon) || polygon.length < 3) {
            nativeLog('isPointInPolygon: Entrada inválida. Punto: ' + JSON.stringify(point) + ', Polígono: ' + JSON.stringify(polygon));
            return false;
        }
        const x = point[0]; // Longitude
        const y = point[1]; // Latitude
        let isInside = false;

        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            if (!Array.isArray(polygon[i]) || polygon[i].length !== 2 || !Array.isArray(polygon[j]) || polygon[j].length !== 2) {
                nativeLog('isPointInPolygon: Vértice de polígono inválido en el bucle. Vértice i: ' + JSON.stringify(polygon[i]) + ', Vértice j: ' + JSON.stringify(polygon[j]));
                continue; 
            }
            const xi = polygon[i][0]; 
            const yi = polygon[i][1]; 
            const xj = polygon[j][0]; 
            const yj = polygon[j][1]; 

            // ((yi > y) !== (yj > y)) : Chequea si el segmento cruza la horizontal del punto
            // (x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-9) + xi) : Chequea si el punto está a la izquierda de la línea del segmento
            // El || 1e-9 es para evitar la división por cero si yj - yi es 0 (segmento horizontal)
            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-9) + xi);
            
            if (intersect) {
                isInside = !isInside;
            }
        }
        return isInside;
    }

    function checkZonaFStatus(longitude, latitude) {
        if (typeof longitude !== 'number' || typeof latitude !== 'number' || isNaN(longitude) || isNaN(latitude)) {
             nativeLog(`checkZonaFStatus: Coordenadas inválidas: longitude=${longitude}, latitude=${latitude}`);
             return { text: "Error Coords", color: "grey", shortText: "Crd!" };
        }

        if (!ZONA_F_POLYGONS) { 
            nativeLog('Error MUY INESPERADO: ZONA_F_POLYGONS es null en checkZonaFStatus. Debería haberse inicializado.');
             updateZonaFLoadStatusMessage('Error interno: Datos de Zona F no inicializados para la verificación.', 'error');
            return { text: "Error Interno ZF", color: "grey", shortText: "ErrI" };
        }

        if (ZONA_F_POLYGONS.length === 0) {
            nativeLog('No hay polígonos de Zona F definidos para verificar.');
            return { text: "Fuera de Zona F (No hay datos de zona)", color: "green", shortText: "Ok" };
        }

        const currentPoint = [longitude, latitude]; // Formato [lon, lat]
        nativeLog(`Verificando punto: Lon=${currentPoint[0]}, Lat=${currentPoint[1]} contra ${ZONA_F_POLYGONS.length} polígonos.`);

        for (let i = 0; i < ZONA_F_POLYGONS.length; i++) {
            const polygon = ZONA_F_POLYGONS[i];
            if (Array.isArray(polygon) && polygon.length >= 3) {
                // Asegurarse de que cada vértice del polígono sea un array de 2 números
                let polygonIsValid = true;
                for(let k=0; k < polygon.length; k++) {
                    if (!Array.isArray(polygon[k]) || polygon[k].length !== 2 || typeof polygon[k][0] !== 'number' || typeof polygon[k][1] !== 'number') {
                        nativeLog(`Advertencia: Vértice inválido en polígono F #${i}, vértice #${k}: ${JSON.stringify(polygon[k])}`);
                        polygonIsValid = false;
                        break;
                    }
                }
                if (!polygonIsValid) continue; // Saltar este polígono si tiene vértices inválidos

                if (isPointInPolygon(currentPoint, polygon)) {
                    nativeLog(`Punto (${longitude}, ${latitude}) ESTÁ DENTRO del polígono F #${i}. Polígono: ${JSON.stringify(polygon)}`);
                    return { text: "Dentro de Zona F", color: "red", shortText: "F!" };
                }
            } else {
                nativeLog(`Advertencia: Polígono F #${i} es inválido (no es array o tiene <3 puntos). Contenido: ${JSON.stringify(polygon)}`);
            }
        }
        nativeLog(`Punto (${longitude}, ${latitude}) está FUERA de todas las zonas F.`);
        return { text: "Fuera de Zona F", color: "green", shortText: "Ok" };
    }
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
                        if (lat !== 0 || lng !== 0) { // Asegurarse que no sean 0,0 (a menos que sea válido para tu caso)
                            return { lat, lng };
                        } else {
                            nativeLog('WARN: Coordenadas (0,0) encontradas en inputs de ltdir/lgdir.');
                            return null;
                        }
                    } else {
                        nativeLog('WARN: Valores no numéricos en inputs de ltdir/lgdir.');
                        return null; 
                    }
                } else {
                    // nativeLog('WARN: Inputs ltdir/lgdir no encontrados o vacíos.'); // Comentar si es muy ruidoso
                }
            } catch (e) {
                nativeLog('ERROR obteniendo coordenadas de ltdir/lgdir: ' + e.message);
            }
            return null;
        }

        function gestionarBotones() {
            const coords = obtenerCoordenadas();
            let container = document.querySelector('#contenedorBotonesNativos');

            if (!coords) { 
                if (container) {
                    nativeLog('Sin coordenadas válidas de ltdir/lgdir, eliminando contenedor de botones.');
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

                const zonaFIndicatorElement = document.createElement('div'); 
                zonaFIndicatorElement.id = 'zonaFStatusIndicator';
                zonaFIndicatorElement.style.cssText = `
                    width: 24px; height: 24px; border-radius: 50%;
                    background-color: grey;
                    margin-right: 5px; 
                    display: flex; align-items: center; justify-content: center;
                    font-size: 10px; color: white; font-weight: bold;
                    border: 1px solid #555;
                    flex-shrink: 0; 
                    box-sizing: border-box; 
                `;
                zonaFIndicatorElement.textContent = '?';
                zonaFIndicatorElement.title = 'Estado Zona F no verificado';
                container.appendChild(zonaFIndicatorElement);
                nativeLog('Indicador Zona F creado y añadido al contenedor.');

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
                    const c = obtenerCoordenadas(); // Re-obtener por si cambiaron
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
                    const fallbackParent = document.querySelector('#kt_modal_create_account .modal-body') || document.querySelector('.page_1.current .card-body') || document.body;
                    fallbackParent.appendChild(container);
                    nativeLog('WARN: Contenedor de botones insertado en ubicación de fallback.');
                }
            }

            const zonaFIndicator = document.getElementById('zonaFStatusIndicator');
            if (zonaFIndicator) {
                if (coords.lat != null && coords.lng != null) { 
                    zonaFIndicator.textContent = '...'; 
                    zonaFIndicator.style.backgroundColor = 'orange';
                    zonaFIndicator.title = 'Comprobando Zona F...';
                    nativeLog(`Comprobando Zona F para lng: ${coords.lng}, lat: ${coords.lat}`);

                    const status = checkZonaFStatus(coords.lng, coords.lat); 
                    
                    zonaFIndicator.textContent = status.shortText;
                    zonaFIndicator.style.backgroundColor = status.color;
                    zonaFIndicator.title = status.text;
                    nativeLog(`Indicador Zona F actualizado: ${status.text} (Color: ${status.color}, Texto Corto: ${status.shortText})`);
                } else {
                    zonaFIndicator.textContent = '?';
                    zonaFIndicator.style.backgroundColor = 'grey';
                    zonaFIndicator.title = 'Coordenadas no válidas para verificar Zona F';
                    nativeLog('Coordenadas no válidas (desde ltdir/lgdir) para verificar Zona F en gestionarBotones.');
                }
            }
        }


        nativeLog('Iniciando monitorización de coordenadas/estado (gestionarBotones)...');
        setInterval(gestionarBotones, 700);

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
    }, 1000);

    nativeLog('Script principal de Cobertura inyectado y ejecución iniciada.');
})();
