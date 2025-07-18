(function() {
    // Listener para auto-selección de tipo de documento
    const input = document.querySelector('#documento_identidad');
    const select = document.querySelector('#tipo_doc');
    if (input && select) {
        // FORZAR: Remover cualquier limitación de maxlength del HTML
        input.removeAttribute('maxlength');
        input.setAttribute('maxlength', '11');
        
        input.addEventListener('input', () => {
            // FORZAR: Limpiar y permitir solo números
            let valor = input.value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
            
            // FORZAR: Permitir exactamente hasta 11 caracteres
            if (valor.length > 11) {
                valor = valor.slice(0, 11);
            }
            
            // FORZAR: Asignar el valor limpio
            input.value = valor;
            
            const length = valor.length;
            
            // FORZAR: Auto-selección de tipo de documento
            if (length === 8) {
                select.value = '1';
                select.dispatchEvent(new Event('change'));
            } else if (length === 9) {
                select.value = '3';
                select.dispatchEvent(new Event('change'));
            } else if (length === 11) {
                select.value = '6';
                select.dispatchEvent(new Event('change'));
            }
        });
        
        // FORZAR: También manejar eventos de pegado
        input.addEventListener('paste', (e) => {
            setTimeout(() => {
                let valor = input.value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
                if (valor.length > 11) {
                    valor = valor.slice(0, 11);
                }
                input.value = valor;
                
                const length = valor.length;
                if (length === 8) {
                    select.value = '1';
                    select.dispatchEvent(new Event('change'));
                } else if (length === 9) {
                    select.value = '3';
                    select.dispatchEvent(new Event('change'));
                } else if (length === 11) {
                    select.value = '6';
                    select.dispatchEvent(new Event('change'));
                }
            }, 10);
        });
        // NUEVO: disparar búsqueda al presionar Enter
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const searchBtn = document.querySelector('#search_score_cliente');
                if (searchBtn) {
                    searchBtn.click();
                }
            }
        });
    }

    // Observador para ocultar #info-cliente-general en cuanto aparezca
    const ocultarInfoGeneral = () => {
        const infoDiv = document.querySelector('#info-cliente-general');
        if (infoDiv && infoDiv.style.display !== 'none') {
            infoDiv.style.display = 'none';
        }
    };
    const observer = new MutationObserver(() => {
        ocultarInfoGeneral();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    ocultarInfoGeneral();

    return new Promise((resolve, reject) => {
        function waitForElement(selector) {
            return new Promise((resolve) => {
                const interval = setInterval(() => {
                    const element = document.querySelector(selector);
                    if (element) {
                        clearInterval(interval);
                        resolve(element);
                    }
                }, 100);
            });
        }

        async function performActions() {
            try {
                // Espera por el botón de "Nuevo Lead" y hace clic
                const nuevoLeadButton = await waitForElement('#btnNuevoLead');
                nuevoLeadButton.click();

                // Espera 100ms antes de proceder con el flujo siguiente
                await new Promise(resolve => setTimeout(resolve, 100));

                // Ejecuta la lógica de flujo de Score
                await ejecutarFlujoScore();

                // Elimina los elementos innecesarios después de que se haya mostrado la segunda página
                eliminarElementos();

                resolve("Flujo de Score ejecutado correctamente.");
            } catch (error) {
                console.error("Error: ", error);
                if (typeof AndroidInterface !== 'undefined' && AndroidInterface.logError) {
                    AndroidInterface.logError("Error en performActions: " + error.message + (error.stack ? " Stack: " + error.stack : ""));
                }
                reject("Error: " + error.message);
            }
        }

        async function ejecutarFlujoScore() {
            try {
                // Inicializa el contador en 1 para que empiece en la segunda página
                let countador_ = 1;

                // Oculta la primera página y muestra la segunda directamente
                const page0 = await waitForElement('.page_0');
                const page1 = await waitForElement('.page_1');
                const pageContent0 = await waitForElement('#page_content_0');
                const pageContent1 = await waitForElement('#page_content_1');

                page0.classList.remove('current');
                page1.classList.add('current');
                pageContent0.classList.remove('current');
                pageContent1.classList.add('current');

                // Muestra el botón "anterior" y habilita el botón "continuar"
                const anteriorBtn = await waitForElement("#anterior");
                anteriorBtn.style.display = 'block';

                const continuarBtn = document.querySelector("#continuar"); // Puede no existir siempre
                if (continuarBtn) {
                    continuarBtn.disabled = false;
                }

            } catch (error) {
                console.error('Error al ejecutar el flujo de Score:', error);
                if (typeof AndroidInterface !== 'undefined' && AndroidInterface.logError) {
                    AndroidInterface.logError("Error en ejecutarFlujoScore: " + error.message + (error.stack ? " Stack: " + error.stack : ""));
                }
            }
        }

        function eliminarElementos() {
            // Solo ocultar la info general, no eliminar
            const infoDiv = document.querySelector('#info-cliente-general');
            if (infoDiv) {
                infoDiv.style.display = 'none';
            }

            // Mejora: eliminar los nuevos bloques de checkboxes
            const tratamientoDiv = document.querySelector('input#checkTratamientoDatos')?.closest('div.col-md-12');
            if (tratamientoDiv) {
                tratamientoDiv.remove();
            }
            // Mejora: eliminar el bloque de "Vendedor"
            const vendedorDiv = document.querySelector('select[name="agencia"]')?.closest('div.row.g-9.mb-8');
            if (vendedorDiv) {
                vendedorDiv.remove();
            }

            const selectores = [
                '#kt_modal_create_account > div > div > div.modal-header',
                '#kt_create_account_stepper > div.stepper-nav.py-5',
                '#nuevo_seguimiento > div.page_1.current > div > div > div > div.col-lg-5',
                '#nuevo_seguimiento > div.page_1.current > div > div > div > div > div:nth-child(6)',
                '#nuevo_seguimiento > div.page_1.current > div > div > div > div > div:nth-child(8)',
                '#nuevo_seguimiento > div.page_1.current > div > div > div > div > div:nth-child(10) > div > label',
                //'textarea[name="bus_obs"]#observaciones', // Se elimina el contenedor padre en su lugar.
                //'#nuevo_seguimiento > div.page_1.current > div > div > div > div:nth-child(11)', // Se elimina el contenedor padre en su lugar.
                '#register_search',
                '#kt_create_account_stepper > div.d-flex.flex-stack.pt-15',
                '#nuevoCliente'
                //'#nuevo_seguimiento > div.page_1.current > div > div > div > div.col-lg-7 > div:nth-child(12) > div > span.fw-bolder' // Se elimina el contenedor padre en su lugar.
            ];

            selectores.forEach(selector => {
                try {
                    const element = document.querySelector(selector);
                    if (element) {
                        element.remove();
                    }
                } catch (e) {
                    // Log error if AndroidInterface is available
                    if (typeof AndroidInterface !== 'undefined' && AndroidInterface.logError) {
                        AndroidInterface.logError("Error eliminando selector: " + selector + " - " + e.message);
                    }
                }
            });

            // Bloque para eliminar elementos solicitados explícitamente que requieren lógica de traversal.
            try {
                document.querySelector('select#tipo_servicio')?.closest('.row.g-9')?.remove();
                document.querySelectorAll('select#relacionPredio').forEach(el => el.closest('.row.g-9.mb-8')?.remove());
                document.querySelector('textarea#observaciones')?.closest('.col-md-12.fv-row')?.remove();
            } catch (e) {
                if (typeof AndroidInterface !== 'undefined' && AndroidInterface.logError) {
                    AndroidInterface.logError("Error en bloque de eliminación de contenedores: " + e.message);
                }
            }


            // Función específica para ocultar el contador usando múltiples métodos
            function ocultarContador() {
                try {
                    // 1. Usando XPath específico
                    const xpath = '/html/body/div[1]/div[1]/div[1]/div[4]/div/div/div[2]/div/div[2]/div[2]/div/div/div/div[2]/div[10]'; // Ajusta si la estructura cambia mucho
                    const xpathResult = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                    const elementByXPath = xpathResult.singleNodeValue;

                    if (elementByXPath) {
                        const spanContador = elementByXPath.querySelector('span.fw-bolder');
                        if (spanContador && spanContador.textContent.includes('Quedan')) { // Más específico
                            spanContador.remove();
                            return; // Si se eliminó por XPath, no es necesario continuar
                        }
                    }

                    // 2. Usando el div padre exacto con la clase row mb-8 y buscando el span
                    const divsRow = document.querySelectorAll('.row.mb-8'); // Puede haber varios
                    divsRow.forEach(divRow => {
                        const spans = divRow.querySelectorAll('span.fw-bolder');
                        spans.forEach(span => {
                            if (span.textContent.includes('Quedan')) {
                                span.remove();
                            }
                        });
                    });


                    // 3. Agregar estilos CSS específicos como último recurso
                    // (Puede ser demasiado agresivo, usar con cuidado)
                    const styleId = 'dynamic-hide-style';
                    if (!document.getElementById(styleId)) {
                        const style = document.createElement('style');
                        style.id = styleId;
                        style.textContent = `
                            /* Intenta ser específico para el contador de "Quedan X consultas" */
                            div.row.mb-8 > div.col-md-6 > span.fw-bolder, /* Asumiendo estructura si es visible */
                            #contadorCaracteres, /* Si existe este ID */
                            #kt_body > div.page_1.current > div > div > div > div.col-lg-7 > div:nth-child(12) > div > span.fw-bolder /* Otro selector más profundo */
                            {
                                display: none !important;
                                visibility: hidden !important;
                                opacity: 0 !important;
                            }
                        `;
                        document.head.appendChild(style);
                    }
                } catch (e) {
                    if (typeof AndroidInterface !== 'undefined' && AndroidInterface.logError) {
                        AndroidInterface.logError("Error en ocultarContador: " + e.message);
                    }
                }
            }

            // Ejecutar la función de ocultamiento
            ocultarContador();

            // Notificar a Android que las acciones se han completado
            if (typeof AndroidInterface !== 'undefined' && AndroidInterface.onActionsCompleted) {
                AndroidInterface.onActionsCompleted();
            }
            if (typeof AndroidInterface !== 'undefined' && AndroidInterface.setElementosEliminados) {
                AndroidInterface.setElementosEliminados(true);
            }
        }

        function waitForScoreValido() {
            return new Promise((resolve) => {
                const interval = setInterval(() => {
                    const scoreDiv = document.querySelector('#score_customer_div');
                    const scoreSpan = document.querySelector('#score_customer_div #estamos_verificando');
                    if (scoreDiv && scoreSpan) {
                        const scoreText = scoreSpan.textContent.trim();
                        // Considera válido si empieza con 'Score:' y tiene un rango
                        const esScoreValido = /^Score:\s*\d+\s*-\s*\d+/.test(scoreText);
                        if (esScoreValido) {
                            clearInterval(interval);
                            resolve(scoreText);
                        }
                    }
                }, 200);
            });
        }

        // Enviar el documento al hacer clic en el botón
        const searchBtn = document.querySelector('#search_score_cliente');
        if (searchBtn) {
            searchBtn.addEventListener('click', async () => {
                const valorDocumento = document.querySelector('#documento_identidad')?.value.trim() || '';
                const tipoDoc = document.querySelector('#select2-tipo_doc-container')?.textContent.trim() || '';
                const nombreAsesor = window.nombreAsesor || '';

                if (valorDocumento.length > 0) {
                    // Espera a que el score sea válido
                    const score = await waitForScoreValido();

                    // Ahora sí, toma los datos ya cargados
                    const nombre = document.querySelector('#cli_nom')?.value.trim() || '';
                    const apellidoPaterno = document.querySelector('#cli_ape_pat')?.value.trim() || '';
                    const apellidoMaterno = document.querySelector('#cli_ape_mat')?.value.trim() || '';

                    const datosAEnviar = {
                        documento: valorDocumento,
                        tipo_documento: tipoDoc,
                        score: score,
                        nombre: nombre,
                        apellido_paterno: apellidoPaterno,
                        apellido_materno: apellidoMaterno,
                        asesor: nombreAsesor
                    };
                    // Imprime todos los datos en consola
                    console.log('Datos a enviar a Google Sheet:', datosAEnviar);

                    fetch('https://script.google.com/macros/s/AKfycbwdGjqGxH_fxqZTgtpy9fIb3apLfqAxB-PHKk60FVwnpofFMnSNgmmlIMtG_l5Wwwsc/exec', {
                        method: 'POST',
                        mode: 'no-cors',
                        body: JSON.stringify(datosAEnviar)
                    }).then(() => {
                        console.log('Datos enviados a Google Sheet:', datosAEnviar);
                    }).catch(err => {
                        console.error('Error al enviar datos:', err);
                    });
                }
            });
        }
        performActions();
    });
})();
