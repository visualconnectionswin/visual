package com.win.visualconnections.ui

import android.content.Context
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.win.visualconnections.LocationHandler
import com.win.visualconnections.ui.components.WebViewScreen
import com.win.visualconnections.util.JavaScriptFetcher
import kotlinx.coroutines.launch

@Composable
fun CoberturaScreen() {
    var isLoading by remember { mutableStateOf(true) }
    var isSessionExpired by remember { mutableStateOf(false) }

    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    // Estados para los scripts de Cobertura
    var coberturaGenericJsContent by remember { mutableStateOf<String?>(null) }
    var coberturaWithCoordsJsTemplateContent by remember { mutableStateOf<String?>(null) }
    var scriptsReady by remember { mutableStateOf(false) }

    // Coordenadas y timestamp
    val currentCoords = remember { LocationHandler.getCoordinates() }
    val currentTimestamp = remember { LocationHandler.getLastUpdateTimestamp() }
    val coordinatesString = currentCoords?.let { "${it.first},${it.second}" } ?: ""
    val cameFromLatestIntent = remember {
        currentCoords != null && currentTimestamp != 0L && currentTimestamp == LocationHandler.getLastUpdateTimestamp()
    }

    // Log y carga de scripts
    LaunchedEffect(Unit) {
        android.util.Log.d(
            "CoberturaScreen",
            "Iniciando CoberturaScreen con coordenadas: $coordinatesString (timestamp: $currentTimestamp). Considerado del último intent: $cameFromLatestIntent"
        )

        scriptsReady = false
        android.util.Log.d("CoberturaScreen", "LaunchedEffect: Obteniendo scripts JS para CoberturaScreen...")
        coroutineScope.launch {
            val fetchedGenericScript = JavaScriptFetcher.getCoberturaGenericJs(context)
            val fetchedWithCoordsTemplate = JavaScriptFetcher.getCoberturaWithCoordsJsTemplate(context)

            // Lógica de logging similar a ScoreScreen (opcional pero útil para depurar)
            val defaultGenericForComparison = JavaScriptFetcher.loadDefaultScriptFromAssets(context, JavaScriptFetcher.DEFAULT_COBERTURA_GENERIC_JS_ASSET_PATH)
            val defaultWithCoordsForComparison = JavaScriptFetcher.loadDefaultScriptFromAssets(context, JavaScriptFetcher.DEFAULT_COBERTURA_WITH_COORDS_JS_ASSET_PATH)

            val prefs = context.getSharedPreferences("JsCachePrefs", Context.MODE_PRIVATE)
            val currentVersionInPrefs = prefs.getInt("cached_js_version", 0)

            if (currentVersionInPrefs > 0) {
                if (fetchedGenericScript == defaultGenericForComparison) {
                    android.util.Log.w("CoberturaScreen", "Advertencia: Usando script DEFAULT (assets) para Cobertura Genérico, pero SharedPreferences indica v$currentVersionInPrefs.")
                }
                if (fetchedWithCoordsTemplate == defaultWithCoordsForComparison) {
                    android.util.Log.w("CoberturaScreen", "Advertencia: Usando script DEFAULT (assets) para Cobertura Con Coordenadas, pero SharedPreferences indica v$currentVersionInPrefs.")
                }
            } else {
                if (fetchedGenericScript == defaultGenericForComparison) {
                    android.util.Log.i("CoberturaScreen", "Info: Usando script DEFAULT (assets) para Cobertura Genérico, SharedPreferences indica v0.")
                }
                if (fetchedWithCoordsTemplate == defaultWithCoordsForComparison) {
                    android.util.Log.i("CoberturaScreen", "Info: Usando script DEFAULT (assets) para Cobertura Con Coordenadas, SharedPreferences indica v0.")
                }
            }

            coberturaGenericJsContent = fetchedGenericScript
            coberturaWithCoordsJsTemplateContent = fetchedWithCoordsTemplate

            // scriptsReady depende de que ambos scripts se carguen correctamente
            scriptsReady = (fetchedGenericScript != null && fetchedWithCoordsTemplate != null)

            if (scriptsReady) {
                android.util.Log.d("CoberturaScreen", "LaunchedEffect: Todos los scripts JS para CoberturaScreen obtenidos y listos.")
            } else {
                android.util.Log.e(
                    "CoberturaScreen",
                    "LaunchedEffect: Error al obtener uno o más scripts para CoberturaScreen." +
                            " Generic: ${fetchedGenericScript!=null}, WithCoords: ${fetchedWithCoordsTemplate!=null}"
                )
            }
        }
    }

    val coberturaUrl = "https://appwinforce.win.pe/nuevoSeguimiento"

    DisposableEffect(cameFromLatestIntent) {
        onDispose {
            if (cameFromLatestIntent) {
                android.util.Log.d("CoberturaScreen","DisposableEffect (onDispose): Saliendo de CoberturaScreen que procesó Intent (Timestamp: $currentTimestamp). Limpiando coords.")
                LocationHandler.clearCoordinates()
            } else {
                android.util.Log.d("CoberturaScreen","DisposableEffect (onDispose): Saliendo de CoberturaScreen (navegación manual). No se limpian coords.")
            }
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        if (isSessionExpired) {
            LoginScreen(onLoginSuccess = {
                isSessionExpired = false
            })
        } else {
            // Comprobar que los scripts estén listos
            if (scriptsReady && coberturaGenericJsContent != null && coberturaWithCoordsJsTemplateContent != null) {
                WebViewScreen(
                    url = coberturaUrl,
                    onPageStarted = {
                        isLoading = true
                        android.util.Log.d("CoberturaScreen", "WebView: Inicio de carga de página...")
                    },
                    onPageFinished = {
                        isLoading = false
                        android.util.Log.d("CoberturaScreen", "WebView: Carga de página finalizada.")
                    },
                    onSessionExpired = {
                        isSessionExpired = true
                    },
                    onExecuteJavaScript = { webView ->
                        val mainScriptToExecute: String? = if (coordinatesString.isNotEmpty()) {
                            coberturaWithCoordsJsTemplateContent
                                ?.replace("\"%KOTLIN_COORDS_PLACEHOLDER%\"", "\"$coordinatesString\"")
                                ?.replace("%KOTLIN_TIMESTAMP_PLACEHOLDER%", currentTimestamp.toString())
                            android.util.Log.d("CoberturaScreen", "Preparando inyección de JS de Cobertura CON COORDENADAS.")
                            coberturaWithCoordsJsTemplateContent
                                ?.replace("\"%KOTLIN_COORDS_PLACEHOLDER%\"", "\"$coordinatesString\"")
                                ?.replace("%KOTLIN_TIMESTAMP_PLACEHOLDER%", currentTimestamp.toString())
                        } else {
                            android.util.Log.d("CoberturaScreen", "Preparando inyección de JS de Cobertura GENÉRICO.")
                            coberturaGenericJsContent
                        }

                        if (mainScriptToExecute != null) {
                            android.util.Log.d("CoberturaScreen", "Inyectando JS principal de Cobertura.")
                            webView.evaluateJavascript(mainScriptToExecute) { result ->
                                android.util.Log.d("CoberturaScreen", "Resultado de ejecución JS: $result")
                            }
                        } else {
                            android.util.Log.e(
                                "CoberturaScreen", "Error: Script de Cobertura principal es nulo al intentar inyectar. mainScript NULO: ${mainScriptToExecute == null}"
                            )
                        }
                    }
                )
            } else {
                LoadingScreen()
                if (!scriptsReady) {
                    android.util.Log.d("CoberturaScreen", "Mostrando LoadingScreen: scriptsReady es false.")
                } else {
                    android.util.Log.d(
                        "CoberturaScreen", "Mostrando LoadingScreen: algún script de cobertura es null." +
                                " Generic: ${coberturaGenericJsContent!=null}, WithCoords: ${coberturaWithCoordsJsTemplateContent!=null}"
                    )
                }
            }
        }

        if (scriptsReady && isLoading) { // isLoading de la página web
            LoadingScreen()
            android.util.Log.d("CoberturaScreen", "Mostrando LoadingScreen: scriptsReady=true, webViewIsLoading=true.")
        }
    }
}
