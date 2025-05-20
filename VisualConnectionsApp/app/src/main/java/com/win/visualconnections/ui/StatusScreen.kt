//StatusScreen.kt
package com.win.visualconnections.ui

import android.content.Context
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.win.visualconnections.ui.components.WebViewScreen
import com.win.visualconnections.util.JavaScriptFetcher // IMPORTAR
import kotlinx.coroutines.launch // IMPORTAR

@Composable
fun StatusScreen() {
    var webViewIsLoading by remember { mutableStateOf(true) } // Renombrado para claridad
    var isSessionExpired by remember { mutableStateOf(false) }

    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var statusJsContent by remember { mutableStateOf<String?>(null) }
    var scriptsReady by remember { mutableStateOf(false) }

    LaunchedEffect(key1 = Unit) {
        scriptsReady = false
        android.util.Log.d("StatusScreen", "LaunchedEffect: Obteniendo script JS para StatusScreen...")
        coroutineScope.launch {
            // Usar la nueva función para obtener el script de Status
            val fetchedScript = JavaScriptFetcher.getStatusJs(context)

            // Lógica de logging similar a ScoreScreen (opcional pero útil para depurar)
            val defaultScriptForComparison = JavaScriptFetcher.loadDefaultScriptFromAssets(context, JavaScriptFetcher.DEFAULT_STATUS_JS_ASSET_PATH)
            val prefs = context.getSharedPreferences("JsCachePrefs", Context.MODE_PRIVATE) // Usar Context.MODE_PRIVATE
            val currentVersionInPrefs = prefs.getInt("cached_js_version", 0)

            if (currentVersionInPrefs > 0 && fetchedScript == defaultScriptForComparison) {
                android.util.Log.w("StatusScreen", "Advertencia: Usando script DEFAULT (assets) para Status, pero SharedPreferences indica v$currentVersionInPrefs.")
            } else if (currentVersionInPrefs == 0 && fetchedScript == defaultScriptForComparison) {
                android.util.Log.i("StatusScreen", "Info: Usando script DEFAULT (assets) para Status, SharedPreferences indica v0.")
            }

            statusJsContent = fetchedScript
            scriptsReady = true
            android.util.Log.d("StatusScreen", "LaunchedEffect: Script JS para StatusScreen obtenido y listo.")
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        if (isSessionExpired) {
            LoginScreen(onLoginSuccess = {
                isSessionExpired = false
            })
        } else {
            if (scriptsReady && statusJsContent != null) {
                WebViewScreen(
                    url = "https://appwinforce.win.pe/listaVenta",
                    onPageStarted = {
                        webViewIsLoading = true
                        android.util.Log.d("StatusScreen", "WebView: Inicio de carga de página...")
                    },
                    onPageFinished = {
                        webViewIsLoading = false
                        android.util.Log.d("StatusScreen", "WebView: Carga de página finalizada.")
                    },
                    onSessionExpired = {
                        isSessionExpired = true
                    },
                    onExecuteJavaScript = { webView ->
                        statusJsContent?.let { script ->
                            android.util.Log.i("StatusScreen", "Inyectando JS de Status...")
                            webView.evaluateJavascript(script, null)
                        } ?: android.util.Log.e("StatusScreen", "Error: Script de Status es nulo al intentar inyectar.")
                    }
                )
            } else {
                LoadingScreen()
                if (!scriptsReady) android.util.Log.d("StatusScreen", "Mostrando LoadingScreen: scriptsReady es false.")
                if (statusJsContent == null) android.util.Log.d("StatusScreen", "Mostrando LoadingScreen: statusJsContent es null.")
            }
        }

        if (scriptsReady && webViewIsLoading) {
            LoadingScreen()
            android.util.Log.d("StatusScreen", "Mostrando LoadingScreen: scriptsReady=true, webViewIsLoading=true.")
        }
    }
}