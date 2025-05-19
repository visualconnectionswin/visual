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

    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzAb9QwsltGjAIBjzdxTr2BiJlwJ6JRWcz9XgWirsGRGhftygGgAXcqWaSy8bwD4VOf/exec'; // <<< REEMPLAZA ESTO CON TU URL DE GOOGLE APPS SCRIPT

    let lastCheckedLatForZonaF = null;
    let lastCheckedLngForZonaF = null;

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

        function comprobarZonaF(coords, statusElement) {
            if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'TU_URL_DE_APPS_SCRIPT_AQUI_VA_AQUI') {
                nativeLog('ERROR: La URL de Google Apps Script no está configurada.');
                statusElement.textContent = 'Error Config GS';
                statusElement.style.backgroundColor = '#ffc107'; // Amarillo
                statusElement.style.color = '#000';
                return;
            }

            nativeLog(`Comprobando Zona F para: ${coords.lat}, ${coords.lng}`);
            statusElement.textContent = 'Comprobando Zona F';
            statusElement.style.backgroundColor = '#808080'; // Gris
            statusElement.style.color = '#fff';

            const params = new URLSearchParams({
                lat: coords.lat,
                lng: coords.lng
            });
            const url = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;

            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error HTTP! estado: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    nativeLog('Respuesta de Zona F: ' + JSON.stringify(data));
                    if (data.status === 'DENTRO') {
                        statusElement.textContent = 'Dentro de Zona F';
                        statusElement.style.backgroundColor = '#dc3545'; // Rojo
                        statusElement.style.color = '#fff';
                    } else if (data.status === 'FUERA') {
                        statusElement.textContent = 'Fuera de Zona F';
                        statusElement.style.backgroundColor = '#28a745'; // Verde
                        statusElement.style.color = '#fff';
                    } else {
                        statusElement.textContent = 'Error Zona F';
                        statusElement.style.backgroundColor = '#ffc107'; // Amarillo
                        statusElement.style.color = '#000';
                        nativeLog('Respuesta desconocida de Zona F: ' + (data.status || JSON.stringify(data)));
                    }
                })
                .catch(error => {
                    nativeLog('Error al comprobar Zona F: ' + error.message);
                    statusElement.textContent = 'Error Red Zona F';
                    statusElement.style.backgroundColor = '#ffc107'; // Amarillo
                    statusElement.style.color = '#000';
                });
        }

        function gestionarBotones() {
            const coords = obtenerCoordenadas();
            let container = document.querySelector('#contenedorBotonesNativos');
            // Intentar obtener el elemento de estado de Zona F del DOM en cada ejecución
            let zonaFStatusElement = document.getElementById('zonaFStatusDisplayNativo');

            if (!coords) {
                if (container) {
                    nativeLog('Sin coordenadas válidas, eliminando botones y estado Zona F.');
                    container.remove(); // Esto eliminará también zonaFStatusElement si es hijo
                }
                // Si por alguna razón zonaFStatusElement existe fuera del container y no hay coords.
                if (zonaFStatusElement && !zonaFStatusElement.closest('#contenedorBotonesNativos')) {
                    zonaFStatusElement.remove();
                }
                lastCheckedLatForZonaF = null;
                lastCheckedLngForZonaF = null;
                return;
            }

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

                // Crear elemento de estado Zona F
                zonaFStatusElement = document.createElement('div');
                zonaFStatusElement.id = 'zonaFStatusDisplayNativo';
                // Estilo inicial, se actualizará en comprobarZonaF
                zonaFStatusElement.style.cssText = `
                    padding: 8px 12px;
                    background-color: #808080; /* Gris inicial */
                    color: #fff;
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
            
            // Re-obtener referencia a zonaFStatusElement por si se acaba de crear
            zonaFStatusElement = document.getElementById('zonaFStatusDisplayNativo');

            // Comprobar Zona F si las coordenadas cambiaron o es la primera vez que el elemento existe con coordenadas válidas
            if (zonaFStatusElement && (coords.lat !== lastCheckedLatForZonaF || coords.lng !== lastCheckedLngForZonaF)) {
                nativeLog('Coordenadas para Zona F actualizadas (' + coords.lat + ',' + coords.lng + ') o primera vez. Verificando...');
                comprobarZonaF(coords, zonaFStatusElement); // La función ahora actualiza el texto a "Comprobando..."
                lastCheckedLatForZonaF = coords.lat;
                lastCheckedLngForZonaF = coords.lng;
            } else if (zonaFStatusElement && coords.lat === lastCheckedLatForZonaF && coords.lng === lastCheckedLngForZonaF) {
                // nativeLog('Coordenadas para Zona F (' + coords.lat + ',' + coords.lng + ') sin cambios. No se vuelve a verificar.');
            } else if (!zonaFStatusElement && coords) {
                 // Esto podría pasar si el elemento no se encontró por alguna razón después de que se supone que el contenedor existe
                nativeLog('WARN: zonaFStatusDisplayNativo no encontrado, pero hay coordenadas. Se intentará en el próximo ciclo.');
            }
        }

        nativeLog('Iniciando monitorización de coordenadas/estado...');
        setInterval(gestionarBotones, 500); // Aumentado ligeramente para dar margen a las operaciones del DOM

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
