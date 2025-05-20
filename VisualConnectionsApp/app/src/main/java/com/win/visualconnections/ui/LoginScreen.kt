// LoginScreen.kt
package com.win.visualconnections.ui

import android.webkit.CookieManager
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.FloatingActionButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.win.visualconnections.ui.components.WebViewScreen

@Composable
fun LoginScreen(onLoginSuccess: () -> Unit) {
    // Trigger para recrear el WebView al iniciar "Nueva sesión" (borra cookies y recarga)
    var reloadTrigger by remember { mutableIntStateOf(0) }

    Box(modifier = Modifier.fillMaxSize()) {
        // Cada vez que reloadTrigger cambie, se reconstruye este WebView sin cookies antiguas
        key(reloadTrigger) {
            WebViewScreen(
                url = "https://accesoventas.win.pe/",
                onPageLoaded = { url ->
                    if (url == "https://appwinforce.win.pe/consultarpedidos") {
                        onLoginSuccess()
                    }
                },
                onExecuteJavaScript = { webView ->
                    webView.evaluateJavascript(
                        "document.querySelector('body > div > div.button-container > button.login-button.google').click();",
                        null
                    )
                }
            )
        }

        // Botón flotante "Nueva sesión"
        ExtendedFloatingActionButton(
            icon = {
                Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = "Icono de nueva sesión"
                )
            },
            text = { Text("Restablecer sesión") },
            onClick = {
                // Eliminar solo cookies de https://appwinforce.win.pe/*
                val cookieManager = CookieManager.getInstance()
                val domainUrl = "https://appwinforce.win.pe"
                cookieManager.getCookie(domainUrl)
                    ?.split(";")
                    ?.forEach { cookie ->
                        val name = cookie.substringBefore("=").trim()
                        cookieManager.setCookie(
                            domainUrl,
                            "$name=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Domain=.appwinforce.win.pe; Path=/"
                        )
                    }
                cookieManager.flush()
                // Fuerza la reconstrucción del WebView
                reloadTrigger++
            },
            containerColor = MaterialTheme.colorScheme.primary,
            contentColor = MaterialTheme.colorScheme.onPrimary,
            elevation = FloatingActionButtonDefaults.elevation(),
            shape = MaterialTheme.shapes.extraLarge,
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(16.dp)
        )
    }
}
