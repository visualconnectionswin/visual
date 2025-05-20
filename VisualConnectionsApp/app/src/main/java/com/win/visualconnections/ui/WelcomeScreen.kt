package com.win.visualconnections.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.win.visualconnections.R

@Composable
fun WelcomeScreen(
    onNavigateToLogin: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0x00FFFFFF)) // Fondo principal con el color corporativo
            .padding(horizontal = 32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Image(
            painter = painterResource(id = R.drawable.logo_), // Coloca el logo de la marca
            contentDescription = "Logo de Win"
            //colorFilter = ColorFilter.tint(Color.White)
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Bienvenido a Visual Connections",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF015D8C), // Color azul corporativo
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(vertical = 16.dp)
        )

        Text(
            text = "Conectando tus experiencias al futuro de la fibra óptica.",
            fontSize = 16.sp,
            color = Color.Black,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = onNavigateToLogin,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF5A00)) // Botón en color corporativo
        ) {
            Text(
                text = "Comenzar",
                color = Color.White, // Texto en blanco
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
