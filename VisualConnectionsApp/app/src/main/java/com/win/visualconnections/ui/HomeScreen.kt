package com.win.visualconnections.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.win.visualconnections.ui.components.WebViewScreen

@Composable
fun HomeScreen() {
    // Estado para controlar si está cargando
    var isLoading by remember { mutableStateOf(true) }

    Box(modifier = Modifier.fillMaxSize()) {
        // WebView personalizado que usa tu componente
        WebViewScreen(
            url = "https://visualconnectionswin.github.io/visual",
            modifier = Modifier.fillMaxSize(),
            onPageStarted = {
                isLoading = true
            },
            onPageFinished = {
                isLoading = false
            }
        )

        // Indicador de carga centrado
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier
                    .align(Alignment.Center)
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
fun PreviewHomeScreen() {
    HomeScreen()
}
