package com.win.visualconnections.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import com.win.visualconnections.R
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    userLoggedIn: Boolean,
    hasSeenWelcomeScreen: Boolean,
    onNavigateToWelcome: () -> Unit,
    onNavigateToLogin: () -> Unit
) {
    LaunchedEffect(key1 = true) {
        delay(2000) // Simulando trabajo de inicialización
        when {
            userLoggedIn -> onNavigateToLogin() // Ir directamente al Login si ya está logueado
            hasSeenWelcomeScreen -> onNavigateToLogin() // Si vio el Welcome, ir al Login
            else -> onNavigateToWelcome() // Si no está logueado y no ha visto el Welcome, ir al Welcome
        }
    }

    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Image(
            painter = painterResource(id = R.drawable.logo_),
            contentDescription = "App Logo"
        )
    }
}