(function() {
    // Usar el log nativo para depurar el JS desde Android Studio
    function nativeLog(message) {
        try {
            window.AndroidInterface.log('Cobertura JS: ' + message);
        } catch (e) {
            console.log('Fallback Console (Cobertura JS): ' + message);
        }
    }

    nativeLog('Iniciando ejecución...');

    // === INICIO: CONFIGURACIÓN ZONA F ===
    // Constante para el enlace web (actualmente la comprobación es local)
    const ZONA_F_API_URL = 'TU_ENLACE_AQUI_SI_USARAS_SERVICIO_WEB';

    // Tus polígonos en formato lat, lon
    var ZONA_F_POLYGONS_DATA = [
        [ // Polígono 0
            [-12.160958, -76.9483412], [-12.161797, -76.9478155], [-12.1615296, -76.9473595],
            [-12.1607168, -76.9479013], [-12.160958, -76.9483412]
        ],
        [ // Polígono 1
            [-12.0302096, -77.0359573], [-12.0379745, -77.0431242], [-12.038751, -77.039133],
            [-12.0369042, -77.0372019], [-12.038667, -77.0348415], [-12.0407236, -77.0311937],
            [-12.0388139, -77.0306787], [-12.0380375, -77.0319233], [-12.0347846, -77.0297775],
            [-12.0302096, -77.0359573]
        ],
        [ // Polígono 2
            [-12.0190164, -77.0317339], [-12.0202231, -77.0330643], [-12.0205274, -77.032721],
            [-12.0193626, -77.0313799], [-12.0190164, -77.0317339]
        ],
        [ // Polígono 3
            [-12.0172827, -77.0308679], [-12.0178389, -77.0304388], [-12.0181747, -77.0296985],
            [-12.0187938, -77.0292479], [-12.0196648, -77.028808], [-12.0195074, -77.0284969],
            [-12.0185944, -77.0286471], [-12.0177969, -77.0292479], [-12.0172408, -77.0302779],
            [-12.0172827, -77.0308679]
        ],
        [ // Polígono 4
            [-11.8880782, -77.0360612], [-11.8896425, -77.0369624], [-11.889842, -77.0364582],
            [-11.8882987, -77.0356321], [-11.8880782, -77.0360612]
        ],
        [ // Polígono 5
            [-11.9075322, -77.046691], [-11.908729, -77.0472489], [-11.9088969, -77.0481072],
            [-11.9119833, -77.0498453], [-11.9150906, -77.0445881], [-11.9127602, -77.0436225],
            [-11.9130331, -77.0422707], [-11.9123822, -77.0420776], [-11.9119833, -77.0434294],
            [-11.9103247, -77.042099], [-11.9075322, -77.046691]
        ],
        [ // Polígono 6
            [-11.9275654, -77.0553436], [-11.9286571, -77.0532407], [-11.9276913, -77.0526399],
            [-11.9257598, -77.0522966], [-11.9229466, -77.0518245], [-11.921078, -77.0515026],
            [-11.9195874, -77.0506229], [-11.9183697, -77.0530476], [-11.920973, -77.0544638],
            [-11.9206371, -77.0553436], [-11.9236604, -77.0567812], [-11.9241642, -77.0560088],
            [-11.925256, -77.0564594], [-11.9259278, -77.0554079], [-11.9263267, -77.0554938],
            [-11.9265366, -77.0551075], [-11.9275654, -77.0553436]
        ],
        [ // Polígono 7
            [-12.0678633, -77.1329398], [-12.0692692, -77.1331544], [-12.0702134, -77.1319527],
            [-12.0734868, -77.1238632], [-12.0713675, -77.122168], [-12.0661007, -77.1194644],
            [-12.0655813, -77.1199364], [-12.0678633, -77.1329398]
        ],
        [ // Polígono 8
            [-12.0705801, -77.1198506], [-12.0709578, -77.1191747], [-12.0705801, -77.1189172],
            [-12.0701604, -77.1196253], [-12.0705801, -77.1198506]
        ],
        [ // Polígono 9
            [-11.9769164, -77.050894], [-11.9780866, -77.0550138], [-11.9788423, -77.0547778],
            [-11.9776931, -77.0506901], [-11.9769164, -77.050894]
        ],
        [ // Polígono 10
            [-11.9772032, -77.0561161], [-11.9779641, -77.0558962], [-11.977665, -77.0547804],
            [-11.9769356, -77.054995], [-11.9772032, -77.0561161]
        ],
        [ // Polígono 11
            [-12.2409481, -76.9285704], [-12.2418184, -76.9302334], [-12.2431162, -76.9294179],
            [-12.2421172, -76.9278033], [-12.2409481, -76.9285704]
        ],
        [ // Polígono 12 - Este es un ejemplo de un polígono problemático si el anterior no cierra. Asegúrate que los polígonos cierren.
            [-12.0677295, -77.1329973], [-12.0657781, -77.1211742], [-12.0621689, -77.1310232],
            [-12.0677295, -77.1329973]
        ],
        [ // Polígono 13
            [-12.0481956, -77.1314478], [-12.0490428, -77.1320942], [-12.0493248, -77.1330893],
            [-12.049875, -77.1329592], [-12.0496465, -77.1318427], [-12.049422, -77.13166],
            [-12.0495963, -77.13137], [-12.0487648, -77.1307585], [-12.0481956, -77.1314478]
        ],
        [ // Polígono 14
            [-12.1628799, -76.9686225], [-12.1634646, -76.9687646], [-12.1635879, -76.9682926],
            [-12.1630189, -76.9681504], [-12.1628799, -76.9686225]
        ],
        [ // Polígono 15
            [-12.1866168, -76.9805707], [-12.187073, -76.9805331], [-12.1873719, -76.980501],
            [-12.1875974, -76.980501], [-12.1873194, -76.9796105], [-12.1864123, -76.979766],
            [-12.1866168, -76.9805707]
        ],
        [ // Polígono 16
            [-12.0044402, -77.0809394], [-12.0043615, -77.0811003], [-12.0043038, -77.0815027],
            [-12.0047288, -77.0815375], [-12.004965, -77.0814973], [-12.0051486, -77.0813927],
            [-12.005146, -77.0812264], [-12.0050751, -77.0811593], [-12.0046895, -77.0810628],
            [-12.0044402, -77.0809394]
        ],
        [ // Polígono 17
            [-12.0180285, -77.0917619], [-12.0183355, -77.0915151], [-12.0187132, -77.0910484],
            [-12.0184719, -77.0906863], [-12.0177111, -77.0911718], [-12.0180285, -77.0917619]
        ],
        [ // Polígono 18
            [-12.2086502, -76.9462266], [-12.2090539, -76.9469454], [-12.2113556, -76.9456043],
            [-12.2108733, -76.944864], [-12.2086502, -76.9462266]
        ],
        [ // Polígono 19
            [-12.2335223, -76.9185979], [-12.2348539, -76.9178254], [-12.2346389, -76.9174767],
            [-12.2333335, -76.9182545], [-12.2335223, -76.9185979]
        ],
        [ // Polígono 20
            [-12.0356446, -76.9675253], [-12.036909, -76.9669808], [-12.0367463, -76.9665919],
            [-12.0353665, -76.9671712], [-12.0356446, -76.9675253]
        ],
        [ // Polígono 21
            [-11.9311765, -77.0819181], [-11.9314009, -77.0817437], [-11.9316016, -77.0815319],
            [-11.9307514, -77.0804831], [-11.9297752, -77.0812985], [-11.9311765, -77.0819181]
        ],
        [ // Polígono 22
            [-11.9892681, -77.0007624], [-11.9898768, -76.9993864], [-11.9896171, -76.9991236],
            [-11.9895121, -76.9992201], [-11.9893311, -76.9994535], [-11.988872, -77.0006041],
            [-11.9892681, -77.0007624]
        ],
        [ // Polígono 23
            [-12.0255958, -77.0135206], [-12.0259001, -77.013483], [-12.0257218, -77.0118308],
            [-12.0252915, -77.0118737], [-12.0253781, -77.0128581], [-12.0253938, -77.0130512],
            [-12.0255958, -77.0135206]
        ],
        [ // Polígono 24
            [-12.0608059, -77.1096218], [-12.0612255, -77.1095547], [-12.0610629, -77.1086884],
            [-12.0606091, -77.1084845], [-12.0608059, -77.1096218]
        ],
        [ // Polígono 25
            [-12.0531633, -77.0512345], [-12.05416, -77.0512479], [-12.0540813, -77.0505613],
            [-12.0539764, -77.0505371], [-12.0532052, -77.0505264], [-12.0531633, -77.0512345]
        ],
        [ // Polígono 26
            [-11.9183899, -77.0380199], [-11.9192665, -77.0370865], [-11.918802, -77.0366198],
            [-11.9182167, -77.0379422], [-11.9183899, -77.0380199]
        ]
    ];

    /**
     * Verifica si un punto (lat, lng) está dentro de un polígono.
     * Algoritmo de Ray Casting.
     * @param {Array<number>} point - Array [lat, lng]
     * @param {Array<Array<number>>} polygon - Array de vértices [[lat1, lng1], [lat2, lng2], ...]
     * @returns {boolean} - True si el punto está dentro, false si no.
     */
    function pointInPolygon(point, polygon) {
        const lat = point[0];
        const lng = point[1];
        let isInside = false;
        const numVertices = polygon.length;

        if (numVertices < 3) {
            nativeLog('WARN: Polígono con menos de 3 vértices, no se puede comprobar.');
            return false; // Un polígono necesita al menos 3 vértices
        }

        for (let i = 0, j = numVertices - 1; i < numVertices; j = i++) {
            const vertex1 = polygon[i];
            const vertex2 = polygon[j];
            const [lat1, lng1] = vertex1;
            const [lat2, lng2] = vertex2;

            // Verificar si el rayo horizontal desde el punto cruza el segmento (vertex1, vertex2)
            const intersect = ((lng1 > lng) !== (lng2 > lng)) &&
                (lat < (lat2 - lat1) * (lng - lng1) / (lng2 - lng1) + lat1);

            if (intersect) {
                isInside = !isInside;
            }
        }
        return isInside;
    }

    /**
     * Comprueba si las coordenadas dadas están dentro de alguna de las Zonas F.
     * @param {number} lat - Latitud del punto.
     * @param {number} lng - Longitud del punto.
     * @returns {boolean} - True si está en Zona F, false si no.
     */
    function checkIfInZonaF(lat, lng) {
        const point = [lat, lng];
        for (let i = 0; i < ZONA_F_POLYGONS_DATA.length; i++) {
            if (pointInPolygon(point, ZONA_F_POLYGONS_DATA[i])) {
                nativeLog(`Punto (${lat}, ${lng}) DENTRO del polígono F ${i}`);
                return true; // Está dentro de al menos un polígono de Zona F
            }
        }
        nativeLog(`Punto (${lat}, ${lng}) FUERA de todas las Zonas F`);
        return false; // No está en ninguna Zona F
    }
    // === FIN: CONFIGURACIÓN ZONA F ===


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
        } catch (e) {
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

        // 3. Lógica de obtención de coordenadas y creación/gestión de botones/indicadores
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

        function gestionarBotonesY индикаторZonaF() { // Cambiado el nombre para reflejar ambas funcionalidades
            const coords = obtenerCoordenadas();
            let container = document.querySelector('#contenedorBotonesNativos');
            let zonaFIndicator = document.getElementById('zonaFStatusIndicator');

            if (!coords) {
                if (container) {
                    nativeLog('Sin coordenadas válidas, eliminando contenedor de botones e indicador.');
                    container.remove(); // Esto también eliminará el indicador si está dentro.
                }
                return;
            }

            // Si el contenedor no existe, créalo junto con el botón y el indicador
            if (!container) {
                nativeLog('Creando contenedor de botones e indicador Zona F.');
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
                    border-radius: 4px;`;

                // Crear Indicador Zona F
                zonaFIndicator = document.createElement('span'); // Usamos span para texto
                zonaFIndicator.id = 'zonaFStatusIndicator';
                zonaFIndicator.textContent = 'Comprobando Zona F...';
                // Estilos base similares al botón copiar, pero el color de fondo cambiará
                zonaFIndicator.style.cssText = `
                    padding: 8px 12px;
                    background-color: #808080; /* Gris por defecto */
                    color: #fff;
                    border: none;
                    border-radius: 5px;
                    font-size: 13px;
                    flex-shrink: 0;
                    text-align: center;`;
                container.appendChild(zonaFIndicator); // Añadir primero el indicador

                // Crear Botón Copiar Coordenadas
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
                    flex-shrink: 0;`;
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
                container.appendChild(botonCopiar); // Añadir el botón después del indicador

                // Insertar el contenedor en el DOM
                const refElement = document.querySelector('#lgdir');
                const parentContainer = refElement ? refElement.closest('.mb-10') || refElement.parentNode.parentNode : null;
                if (parentContainer) {
                    parentContainer.parentNode.insertBefore(container, parentContainer.nextSibling);
                    nativeLog('Contenedor de botones e indicador insertado cerca de #lgdir.');
                } else {
                    const fallbackContainer = document.querySelector('#kt_modal_create_account .modal-body') || document.querySelector('.page_1.current .card-body') || document.body;
                    fallbackContainer.appendChild(container);
                    nativeLog('WARN: Contenedor de botones e indicador insertado en ubicación de fallback.');
                }
            } else {
                 // Si el contenedor ya existe, asegurarse que el indicador también (podría haber sido removido)
                 if (!zonaFIndicator) {
                    zonaFIndicator = document.getElementById('zonaFStatusIndicator');
                    if (!zonaFIndicator) { // Realmente no está, lo recreamos y lo insertamos al inicio
                        nativeLog('WARN: Indicador Zona F no encontrado, recreando.');
                        zonaFIndicator = document.createElement('span');
                        zonaFIndicator.id = 'zonaFStatusIndicator';
                        zonaFIndicator.style.cssText = `
                            padding: 8px 12px;
                            background-color: #808080; 
                            color: #fff;
                            border: none;
                            border-radius: 5px;
                            font-size: 13px;
                            flex-shrink: 0;
                            text-align: center;`;
                        container.insertBefore(zonaFIndicator, container.firstChild);
                    }
                 }
            }

            // Actualizar el indicador de Zona F si hay coordenadas y el indicador existe
            if (coords && zonaFIndicator) {
                // nativeLog(`Actualizando indicador Zona F para coords: ${coords.lat}, ${coords.lng}`);
                zonaFIndicator.textContent = 'Comprobando Zona F...';
                zonaFIndicator.style.backgroundColor = '#808080'; // Gris
                zonaFIndicator.style.color = '#fff';

                // Simular una pequeña demora si la comprobación fuera asíncrona o para ver el estado "Comprobando"
                // En una implementación real con API, aquí iría la llamada fetch.
                // Para la comprobación local, es casi instantáneo.
                setTimeout(() => {
                    // Asegurarse que el indicador aún existe y las coordenadas no cambiaron a null mientras tanto
                    const currentCoords = obtenerCoordenadas();
                    const currentIndicator = document.getElementById('zonaFStatusIndicator');
                    if (currentCoords && currentIndicator) {
                        const isInZonaF = checkIfInZonaF(currentCoords.lat, currentCoords.lng);
                        if (isInZonaF) {
                            currentIndicator.textContent = 'Dentro de Zona F';
                            currentIndicator.style.backgroundColor = '#dc3545'; // Rojo
                            currentIndicator.style.color = '#fff';
                        } else {
                            currentIndicator.textContent = 'Fuera de Zona F';
                            currentIndicator.style.backgroundColor = '#28a745'; // Verde
                            currentIndicator.style.color = '#fff';
                        }
                    } else if (!currentCoords && currentIndicator) {
                        // Si las coordenadas se volvieron null mientras esperábamos, y el indicador aún existe,
                        // podría ser removido por la lógica de arriba, o podemos limpiarlo.
                        // La lógica superior debería encargarse de remover el contenedor si no hay coords.
                    }
                }, 50); // Pequeño delay para que "Comprobando" sea visible, ajustar si es necesario
            }
        }

        nativeLog('Iniciando monitorización de coordenadas/estado y Zona F...');
        setInterval(gestionarBotonesY индикаторZonaF, 700); // Un poco más de tiempo para permitir la comprobación visual

        // === INICIO: NUEVA FUNCIONALIDAD - MONITOREO PARA BOTÓN "REALIZAR SIMULACIÓN" ===
        // (El resto de tu código de simulación permanece igual)
        const SIMULATION_BUTTON_ID = 'realizar-simulacion-btn';
        const SCORE_DISPLAY_SELECTOR = '#score_customer_div';
        const SCORE_CONTAINER_SELECTOR = '#score_customer_div'; // O donde quieras el botón
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
                            cliTel.dispatchEvent(new Event('change', { bubbles: true }));
                            nativeLog("Teléfono completado");
                        }

                        if (cliEmail) {
                            cliEmail.value = 'demopruebadanna@gmail.com';
                            cliEmail.dispatchEvent(new Event('change', { bubbles: true }));
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
                        checkTratamiento.dispatchEvent(new Event('change', { bubbles: true }));
                        nativeLog("Check tratamiento datos activado");
                    }

                    const tipoServicio = document.querySelector('#tipo_servicio');
                    if (tipoServicio) {
                        tipoServicio.value = '1';
                        tipoServicio.dispatchEvent(new Event('change', { bubbles: true }));
                        nativeLog("Tipo servicio seleccionado");
                    }

                    const relacionPredio = document.querySelector('#relacionPredio');
                    if (relacionPredio) {
                        relacionPredio.value = '2';
                        relacionPredio.dispatchEvent(new Event('change', { bubbles: true }));
                        nativeLog("Relación predio seleccionada");
                    }

                    const tipoInteres = document.querySelector('#tipoInteres');
                    if (tipoInteres) {
                        const options = Array.from(tipoInteres.options);
                        const ventaOption = options.find(o => o.textContent.trim() === 'Venta');
                        if (ventaOption) {
                            tipoInteres.value = ventaOption.value;
                            tipoInteres.dispatchEvent(new Event('change', { bubbles: true }));
                            nativeLog("Tipo interés seleccionado: Venta");
                        }
                    }

                    const agencia = document.querySelector('#agencia');
                    if (agencia) {
                        const options = Array.from(agencia.options);
                        const agenciaOption = options.find(o => o.textContent.trim() === VENDOR_NAME);
                        if (agenciaOption) {
                            agencia.value = agenciaOption.value;
                            agencia.dispatchEvent(new Event('change', { bubbles: true }));
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
            if (c) { // Asegurarse que el contenedor de score existe
                 // Insertar antes del div de score o después, según preferencia. Aquí lo pongo después.
                c.parentNode.insertBefore(b, c.nextSibling);
            } else {
                 nativeLog("WARN: No se encontró SCORE_CONTAINER_SELECTOR para el botón de simulación.");
                 // Fallback: intentar añadirlo al body o a algún contenedor genérico si es crucial
                 const fallbackButtonContainer = document.querySelector('#kt_modal_create_account .modal-body') || document.body;
                 fallbackButtonContainer.appendChild(b);
            }
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
                    nativeLog("Score válido detectado: " + (t.match(/Score:\s*(\d+)/)?.[1] || "N/A"));
                    return;
                } else {
                     nativeLog("Score no válido o no visible: " + (t.match(/Score:\s*(\d+)/)?.[1] || "N/A o no visible"));
                }
            } else {
                 nativeLog("SCORE_DISPLAY_SELECTOR no encontrado o no visible.");
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
                attributes: true, // Observar cambios de atributos como 'style' (display: none)
                attributeFilter: ['style']
            });
            checkScoreAndToggleButton(); // Chequeo inicial
        } else {
            nativeLog('Elemento score no encontrado, programando chequeo periódico para el observer');
            const scoreCheckInterval = setInterval(() => {
                const scoreElement = document.querySelector(SCORE_DISPLAY_SELECTOR);
                if (scoreElement) {
                    clearInterval(scoreCheckInterval);
                    nativeLog('Elemento score encontrado posteriormente, configurando observer');
                    const observer = new MutationObserver(checkScoreAndToggleButton);
                    observer.observe(scoreElement, {
                        childList: true,
                        subtree: true,
                        characterData: true,
                        attributes: true,
                        attributeFilter: ['style']
                    });
                    checkScoreAndToggleButton(); // Chequeo inicial una vez encontrado
                }
            }, 1000);
        }
        // === FIN: NUEVA FUNCIONALIDAD - BOTÓN "REALIZAR SIMULACIÓN" ===
    }, 1000); // Delay principal del script

    nativeLog('Script inyectado y ejecución iniciada.');
})();
