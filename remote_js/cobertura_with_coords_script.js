(function() {
    // Usar el log nativo para depurar el JS desde Android Studio
    function nativeLog(message) {
        try {
            window.AndroidInterface.log('Cobertura JS (Coords): ' + message);
        } catch (e) {
            console.log('Fallback Console (Coords): ' + message);
        }
    }

    // Inyecta los valores de Kotlin
    const kotlinCoords = "%KOTLIN_COORDS_PLACEHOLDER%";
    const kotlinTimestamp = %KOTLIN_TIMESTAMP_PLACEHOLDER%;

    nativeLog('Iniciando ejecución CON COORDENADAS: ' + kotlinCoords + ', timestamp: ' + kotlinTimestamp);

    // === INICIO: DATOS DE POLÍGONOS ZONA F ===
    var ZONA_F_POLYGONS_DATA = [
        [ // Polígono 0
            [-12.160958, -76.9483412],[-12.161797, -76.9478155],[-12.1615296, -76.9473595],[-12.1607168, -76.9479013],[-12.160958, -76.9483412]],
        [ // Polígono 1
            [-12.0302096, -77.0359573],[-12.0379745, -77.0431242],[-12.038751, -77.039133],[-12.0369042, -77.0372019],[-12.038667, -77.0348415],[-12.0407236, -77.0311937],[-12.0388139, -77.0306787],[-12.0380375, -77.0319233],[-12.0347846, -77.0297775],[-12.0302096, -77.0359573]],
        [ // Polígono 2
            [-12.0190164, -77.0317339],[-12.0202231, -77.0330643],[-12.0205274, -77.032721],[-12.0193626, -77.0313799],[-12.0190164, -77.0317339]],
        [ // Polígono 3
            [-12.0172827, -77.0308679],[-12.0178389, -77.0304388],[-12.0181747, -77.0296985],[-12.0187938, -77.0292479],[-12.0196648, -77.028808],[-12.0195074, -77.0284969],[-12.0185944, -77.0286471],[-12.0177969, -77.0292479],[-12.0172408, -77.0302779],[-12.0172827, -77.0308679]],
        [ // Polígono 4
            [-11.8880782, -77.0360612],[-11.8896425, -77.0369624],[-11.889842, -77.0364582],[-11.8882987, -77.0356321],[-11.8880782, -77.0360612]],
        [ // Polígono 5
            [-11.9075322, -77.046691],[-11.908729, -77.0472489],[-11.9088969, -77.0481072],[-11.9119833, -77.0498453],[-11.9150906, -77.0445881],[-11.9127602, -77.0436225],[-11.9130331, -77.0422707],[-11.9123822, -77.0420776],[-11.9119833, -77.0434294],[-11.9103247, -77.042099],[-11.9075322, -77.046691]],
        [ // Polígono 6
            [-11.9275654, -77.0553436],[-11.9286571, -77.0532407],[-11.9276913, -77.0526399],[-11.9257598, -77.0522966],[-11.9229466, -77.0518245],[-11.921078, -77.0515026],[-11.9195874, -77.0506229],[-11.9183697, -77.0530476],[-11.920973, -77.0544638],[-11.9206371, -77.0553436],[-11.9236604, -77.0567812],[-11.9241642, -77.0560088],[-11.925256, -77.0564594],[-11.9259278, -77.0554079],[-11.9263267, -77.0554938],[-11.9265366, -77.0551075],[-11.9275654, -77.0553436]],
        [ // Polígono 7
            [-12.0678633, -77.1329398],[-12.0692692, -77.1331544],[-12.0702134, -77.1319527],[-12.0734868, -77.1238632],[-12.0713675, -77.122168],[-12.0661007, -77.1194644],[-12.0655813, -77.1199364],[-12.0678633, -77.1329398]],
        [ // Polígono 8
            [-12.0705801, -77.1198506],[-12.0709578, -77.1191747],[-12.0705801, -77.1189172],[-12.0701604, -77.1196253],[-12.0705801, -77.1198506]],
        [ // Polígono 9
            [-11.9769164, -77.050894],[-11.9780866, -77.0550138],[-11.9788423, -77.0547778],[-11.9776931, -77.0506901],[-11.9769164, -77.050894]],
        [ // Polígono 10
            [-11.9772032, -77.0561161],[-11.9779641, -77.0558962],[-11.977665, -77.0547804],[-11.9769356, -77.054995],[-11.9772032, -77.0561161]],
        [ // Polígono 11
            [-12.2409481, -76.9285704],[-12.2418184, -76.9302334],[-12.2431162, -76.9294179],[-12.2421172, -76.9278033],[-12.2409481, -76.9285704]],
        [ // Polígono 12
            [-12.0677295, -77.1329973],[-12.0657781, -77.1211742],[-12.0621689, -77.1310232],[-12.0677295, -77.1329973]],
        [ // Polígono 13
            [-12.0481956, -77.1314478],[-12.0490428, -77.1320942],[-12.0493248, -77.1330893],[-12.049875, -77.1329592],[-12.0496465, -77.1318427],[-12.049422, -77.13166],[-12.0495963, -77.13137],[-12.0487648, -77.1307585],[-12.0481956, -77.1314478]],
        [ // Polígono 14
            [-12.1628799, -76.9686225],[-12.1634646, -76.9687646],[-12.1635879, -76.9682926],[-12.1630189, -76.9681504],[-12.1628799, -76.9686225]],
        [ // Polígono 15
            [-12.1866168, -76.9805707],[-12.187073, -76.9805331],[-12.1873719, -76.980501],[-12.1875974, -76.980501],[-12.1873194, -76.9796105],[-12.1864123, -76.979766],[-12.1866168, -76.9805707]],
        [ // Polígono 16
            [-12.0044402, -77.0809394],[-12.0043615, -77.0811003],[-12.0043038, -77.0815027],[-12.0047288, -77.0815375],[-12.004965, -77.0814973],[-12.0051486, -77.0813927],[-12.005146, -77.0812264],[-12.0050751, -77.0811593],[-12.0046895, -77.0810628],[-12.0044402, -77.0809394]],
        [ // Polígono 17
            [-12.0180285, -77.0917619],[-12.0183355, -77.0915151],[-12.0187132, -77.0910484],[-12.0184719, -77.0906863],[-12.0177111, -77.0911718],[-12.0180285, -77.0917619]],
        [ // Polígono 18
            [-12.2086502, -76.9462266],[-12.2090539, -76.9469454],[-12.2113556, -76.9456043],[-12.2108733, -76.944864],[-12.2086502, -76.9462266]],
        [ // Polígono 19
            [-12.2335223, -76.9185979],[-12.2348539, -76.9178254],[-12.2346389, -76.9174767],[-12.2333335, -76.9182545],[-12.2335223, -76.9185979]],
        [ // Polígono 20
            [-12.0356446, -76.9675253],[-12.036909, -76.9669808],[-12.0367463, -76.9665919],[-12.0353665, -76.9671712],[-12.0356446, -76.9675253]],
        [ // Polígono 21
            [-11.9311765, -77.0819181],[-11.9314009, -77.0817437],[-11.9316016, -77.0815319],[-11.9307514, -77.0804831],[-11.9297752, -77.0812985],[-11.9311765, -77.0819181]],
        [ // Polígono 22
            [-11.9892681, -77.0007624],[-11.9898768, -76.9993864],[-11.9896171, -76.9991236],[-11.9895121, -76.9992201],[-11.9893311, -76.9994535],[-11.988872, -77.0006041],[-11.9892681, -77.0007624]],
        [ // Polígono 23
            [-12.0255958, -77.0135206],[-12.0259001, -77.013483],[-12.0257218, -77.0118308],[-12.0252915, -77.0118737],[-12.0253781, -77.0128581],[-12.0253938, -77.0130512],[-12.0255958, -77.0135206]],
        [ // Polígono 24
            [-12.0608059, -77.1096218],[-12.0612255, -77.1095547],[-12.0610629, -77.1086884],[-12.0606091, -77.1084845],[-12.0608059, -77.1096218]],
        [ // Polígono 25
            [-12.0531633, -77.0512345],[-12.05416, -77.0512479],[-12.0540813, -77.0505613],[-12.0539764, -77.0505371],[-12.0532052, -77.0505264],[-12.0531633, -77.0512345]],
        [ // Polígono 26
            [-11.9183899, -77.0380199],[-11.9192665, -77.0370865],[-11.918802, -77.0366198],[-11.9182167, -77.0379422],[-11.9183899, -77.0380199]]
    ];
    // === FIN: DATOS DE POLÍGONOS ZONA F ===

    // === INICIO: FUNCIONES PARA COMPROBAR ZONA F ===
    /**
     * Verifica si un punto está dentro de un polígono usando el algoritmo de ray casting.
     * @param {Array<number>} point - Un array [lat, lon] para el punto.
     * @param {Array<Array<number>>} polygon - Un array de vertices [[lat, lon], [lat, lon], ...].
     * @returns {boolean} - True si el punto está dentro del polígono, false en caso contrario.
     */
    function isPointInPolygon(point, polygon) {
        const lat = point[0]; // y
        const lon = point[1]; // x
        let inside = false;

        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const lat_i = polygon[i][0]; // yi
            const lon_i = polygon[i][1]; // xi
            const lat_j = polygon[j][0]; // yj
            const lon_j = polygon[j][1]; // xj

            const intersect = ((lat_i > lat) !== (lat_j > lat)) &&
                (lon < (lon_j - lon_i) * (lat - lat_i) / (lat_j - lat_i) + lon_i);
            if (intersect) {
                inside = !inside;
            }
        }
        return inside;
    }

    /**
     * Comprueba el estado de un punto (lat, lon) contra ZONA_F_POLYGONS_DATA.
     * @param {number} lat - Latitud del punto.
     * @param {number} lon - Longitud del punto.
     * @returns {string} - "DENTRO" si está en zona F, "FUERA" si no.
     */
    function checkZonaFStatus(lat, lon) {
        const point = [lat, lon];
        for (const polygon of ZONA_F_POLYGONS_DATA) {
            if (isPointInPolygon(point, polygon)) {
                return "DENTRO"; // El punto está dentro de al menos un polígono de Zona F
            }
        }
        return "FUERA"; // El punto no está en ningún polígono de Zona F
    }
    // === FIN: FUNCIONES PARA COMPROBAR ZONA F ===

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
                if (kotlinCoords !== "" && kotlinCoords !== "0,0" && kotlinCoords !== "0.0,0.0") { // Evitar disparar para coords vacías o (0,0)
                    const inputEvent = new Event('input', { bubbles: true });
                    combinedInput.dispatchEvent(inputEvent);
                    nativeLog('Evento input disparado para gf_latlon.');
                }

                // Llenar también los campos #gf_lat y #gf_lon si existen
                if (kotlinCoords !== "" && kotlinCoords !== "0,0" && kotlinCoords !== "0.0,0.0") {
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
        } catch (e) {
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
            let zonaFIndicator = document.getElementById('zonaFStatusIndicatorNativo');

            if (!coords) {
                if (container) {
                    nativeLog('Sin coordenadas válidas en inputs, eliminando botones y status.');
                    container.remove();
                }
                return;
            }

            if (!container) {
                nativeLog('Creando contenedor de botones y status Zona F.');
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

                // === INICIO: Crear Indicador Zona F ===
                zonaFIndicator = document.createElement('span');
                zonaFIndicator.id = 'zonaFStatusIndicatorNativo';
                zonaFIndicator.style.cssText = `
                    padding: 8px 12px; 
                    color: #fff; 
                    border: none; 
                    border-radius: 5px; 
                    font-size: 13px; 
                    flex-shrink: 0;
                    background-color: #808080; /* Gris por defecto */
                `;
                zonaFIndicator.textContent = 'Comprobando Zona F';
                container.appendChild(zonaFIndicator); // Añadirlo primero para que esté a la izquierda
                // === FIN: Crear Indicador Zona F ===

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
            }

            // === INICIO: Actualizar Indicador Zona F (siempre que haya coords y el indicador exista) ===
            if (!zonaFIndicator) { // Asegurarse de tener la referencia
                 zonaFIndicator = document.getElementById('zonaFStatusIndicatorNativo');
            }

            if (zonaFIndicator) {
                zonaFIndicator.textContent = 'Comprobando Zona F';
                zonaFIndicator.style.backgroundColor = '#808080'; // Gris
                zonaFIndicator.style.color = '#ffffff';

                const statusZonaF = checkZonaFStatus(coords.lat, coords.lng);
                nativeLog(`Check Zona F: Lat ${coords.lat}, Lng ${coords.lng} -> ${statusZonaF}`);

                if (statusZonaF === "DENTRO") {
                    zonaFIndicator.textContent = 'Dentro de Zona F';
                    zonaFIndicator.style.backgroundColor = '#dc3545'; // Rojo
                } else { // FUERA
                    zonaFIndicator.textContent = 'Fuera de Zona F';
                    zonaFIndicator.style.backgroundColor = '#28a745'; // Verde
                }
            }
            // === FIN: Actualizar Indicador Zona F ===
        }

        nativeLog('Iniciando monitorización CON COORDENADAS de coordenadas/estado...');
        setInterval(gestionarBotones, 500);

        // === INICIO: NUEVA FUNCIONALIDAD - MONITOREO PARA BOTÓN "REALIZAR SIMULACIÓN" ===
        const SIMULATION_BUTTON_ID = 'realizar-simulacion-btn';
        const SCORE_DISPLAY_SELECTOR = '#score_customer_div';
        const SCORE_CONTAINER_SELECTOR = '#score_customer_div';
        
        function handleSimulationClick() {
            nativeLog("Inicia simulación");
            const btn = document.getElementById(SIMULATION_BUTTON_ID);
            if (btn) btn.disabled = true;
        
            try {
                // Teléfono y correo directamente (ya no es necesario abrir modal)
                const cliTel = document.querySelector('#cli_tel1');
                const cliEmail = document.querySelector('#cli_email');
        
                if (cliTel) {
                    cliTel.value = '999999999';
                    cliTel.dispatchEvent(new Event('change', { bubbles: true }));
                    nativeLog("Teléfono completado");
                }
        
                if (cliEmail) {
                    cliEmail.value = 'demopruebadanna@gmail.com';
                    cliEmail.dispatchEvent(new Event('change', { bubbles: true }));
                    nativeLog("Email completado");
                }
        
                setTimeout(() => {
                    const checkTratamiento = document.querySelector('#checkTratamientoDatos');
                    if (checkTratamiento && !checkTratamiento.checked) {
                        checkTratamiento.checked = true;
                        checkTratamiento.dispatchEvent(new Event('change', { bubbles: true }));
                        nativeLog("Check tratamiento datos activado");
                    }
        
                    const tipoServicio = document.querySelector('#tipo_servicio');
                    if (tipoServicio) {
                        tipoServicio.value = '1';
                        tipoServicio.dispatchEvent(new Event('change', { bubbles: true }));
                        nativeLog("Tipo servicio seleccionado: Hogar");
                    }
        
                    const relacionPredio = document.querySelector('#relacionPredio');
                    if (relacionPredio) {
                        relacionPredio.value = '2';
                        relacionPredio.dispatchEvent(new Event('change', { bubbles: true }));
                        nativeLog("Relación predio seleccionada: Inquilino");
                    }
        
                    const tipoInteres = document.querySelector('#tipoInteres');
                    if (tipoInteres) {
                        const options = Array.from(tipoInteres.options);
                        const ventaOption = options.find(o => o.textContent.trim().toLowerCase() === 'venta');
                        if (ventaOption) {
                            tipoInteres.value = ventaOption.value;
                            tipoInteres.dispatchEvent(new Event('change', { bubbles: true }));
                            nativeLog("Tipo interés seleccionado: Venta");
                        }
                    }
        
                    const agencia = document.querySelector('#agencia');
                    if (agencia) {
                        const firstOption = agencia.options[1];
                        if (firstOption) {
                            agencia.value = firstOption.value;
                            agencia.dispatchEvent(new Event('change', { bubbles: true }));
                            nativeLog("Primer vendedor seleccionado: " + firstOption.textContent);
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
                }, 300);
        
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

        // Listener para auto-selección de tipo de documento
        const inputDoc = document.querySelector('#documento_identidad'); // Renombrado para evitar conflicto con 'input' global si existiera
        const selectDoc = document.querySelector('#tipo_doc'); // Renombrado para evitar conflicto con 'select' global si existiera
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

        // Asegúrate de que el DOM esté completamente cargado antes de ejecutar el script.
        $(document).ready(function() {
        // --- PASO 1: Ocultar visualmente el paso final y su contenido ---
        // Esto se ejecuta una vez para limpiar la interfaz.

        // Oculta el paso "Confirmar venta" en la barra de navegación del stepper.
        $('#page_content_3').hide();

        // Oculta el contenido de la página 3 para que nunca sea visible.
        $('.page_3').hide();


        // --- PASO 2: Crear una función para gestionar el estado del botón "Continuar" ---
        function gestionarEstadoBotonContinuar() {
            // Comprueba si la página activa actual es la página 2 ("Selección de oferta").
            // La clase "current" indica la página activa.
            if ($('.page_2').hasClass('current')) {
                // Si estamos en la página 2, deshabilitamos y ocultamos el botón "Continuar".
                $('#continuar').prop('disabled', true).hide();
            } else {
                // Si estamos en cualquier otra página (0 o 1), nos aseguramos de que el botón esté habilitado y visible.
                $('#continuar').prop('disabled', false).show();
            }
        }


        // --- PASO 3: Ejecutar la función en los momentos correctos ---

        // Al hacer clic en el botón "Continuar"
        $('#continuar').on('click', function() {
            // El framework del stepper necesita un instante para actualizar las clases.
            // Usamos un pequeño retardo (setTimeout) para comprobar el estado DESPUÉS de que se haya movido a la siguiente página.
            setTimeout(function() {
                gestionarEstadoBotonContinuar();
            }, 100); // 100 milisegundos es suficiente.
        });

        // Al hacer clic en el botón "Anterior"
        $('#anterior').on('click', function() {
            // Hacemos lo mismo para asegurarnos de que el botón "Continuar" se reactive si el usuario retrocede desde la página 2.
            setTimeout(function() {
                gestionarEstadoBotonContinuar();
            }, 100);
        });

        // Ejecutamos la función una vez al cargar por si acaso el modal se abre en un estado intermedio (aunque normalmente empieza en la página 0).
        gestionarEstadoBotonContinuar();
        });

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
