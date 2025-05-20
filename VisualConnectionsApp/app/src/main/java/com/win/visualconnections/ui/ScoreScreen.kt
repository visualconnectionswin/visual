//ScoreScreen.kt
package com.win.visualconnections.ui

import android.content.Context
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.win.visualconnections.ui.components.WebViewScreen
import com.win.visualconnections.util.JavaScriptFetcher
import kotlinx.coroutines.launch

@Composable
fun ScoreScreen() {
    var webViewIsLoading by remember { mutableStateOf(true) }
    var isSessionExpired by remember { mutableStateOf(false) }

    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var scoreJsContent by remember { mutableStateOf<String?>(null) }
    var scriptsReady by remember { mutableStateOf(false) }

    LaunchedEffect(key1 = Unit) {
        scriptsReady = false
        android.util.Log.d("ScoreScreen", "LaunchedEffect: Obteniendo script JS para ScoreScreen...")
        coroutineScope.launch {
            val fetchedScript = JavaScriptFetcher.getScoreJs(context)

            // Para comparar, obtenemos el script por defecto desde assets nuevamente.
            // Esto asegura que comparamos el contenido real.
            val defaultScriptForComparison = JavaScriptFetcher.loadDefaultScriptFromAssets(context, JavaScriptFetcher.DEFAULT_SCORE_JS_ASSET_PATH)

            val prefs = context.getSharedPreferences("JsCachePrefs", Context.MODE_PRIVATE)
            val currentVersionInPrefs = prefs.getInt("cached_js_version", 0)

            if (currentVersionInPrefs > 0 && fetchedScript == defaultScriptForComparison) {
                android.util.Log.w("ScoreScreen", "Advertencia: Se está usando el script DEFAULT desde assets, pero SharedPreferences indica versión $currentVersionInPrefs. El archivo cacheado podría estar corrupto o vacío.")
            } else if (currentVersionInPrefs == 0 && fetchedScript == defaultScriptForComparison) {
                android.util.Log.i("ScoreScreen", "Info: Usando script DEFAULT desde assets, SharedPreferences indica versión 0 (primera vez o sin descarga previa).")
            }

            scoreJsContent = fetchedScript
            scriptsReady = true
            android.util.Log.d("ScoreScreen", "LaunchedEffect: Script JS para ScoreScreen obtenido y listo.")
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        if (isSessionExpired) {
            LoginScreen(onLoginSuccess = {
                isSessionExpired = false
            })
        } else {
            if (scriptsReady && scoreJsContent != null) {
                WebViewScreen(
                    url = "https://appwinforce.win.pe/nuevoSeguimiento",
                    onPageStarted = {
                        webViewIsLoading = true
                        android.util.Log.d("ScoreScreen", "WebView: Inicio de carga de página...")
                    },
                    onPageFinished = {
                        webViewIsLoading = false
                        android.util.Log.d("ScoreScreen", "WebView: Carga de página finalizada.")
                    },
                    onSessionExpired = {
                        isSessionExpired = true
                    },
                    onExecuteJavaScript = { webView ->
                        scoreJsContent?.let { script ->
                            android.util.Log.i("ScoreScreen", "Inyectando JS de Score...")
                            webView.evaluateJavascript(script, null)
                        } ?: android.util.Log.e("ScoreScreen", "Error: Script de Score es nulo al intentar inyectar.")
                    }
                )
            } else {
                LoadingScreen()
                if (!scriptsReady) android.util.Log.d("ScoreScreen", "Mostrando LoadingScreen: scriptsReady es false.")
                if (scoreJsContent == null) android.util.Log.d("ScoreScreen", "Mostrando LoadingScreen: scoreJsContent es null.")
            }
        }

        if (scriptsReady && webViewIsLoading) {
            LoadingScreen()
            android.util.Log.d("ScoreScreen", "Mostrando LoadingScreen: scriptsReady=true, webViewIsLoading=true.")
        }
    }
}