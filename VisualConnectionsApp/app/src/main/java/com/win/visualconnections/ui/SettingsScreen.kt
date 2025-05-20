package com.win.visualconnections.ui

import android.content.Intent
import android.net.Uri
import android.webkit.CookieManager
import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.win.visualconnections.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(onBackClick: () -> Unit, onLogoutSuccess: () -> Unit) {
    val showDialog = remember { mutableStateOf(false) }
    val context = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Ajustes", style = MaterialTheme.typography.titleLarge) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Volver",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF015D8C),
                    titleContentColor = Color.White
                )


            )
        },
        content = { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.White)
                    .padding(paddingValues),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Image(
                    painter = painterResource(id = R.drawable.logo_),
                    contentDescription = "Logo de Visual Connections",
                    modifier = Modifier
                        .size(150.dp)
                        .padding(top = 16.dp),
                    contentScale = ContentScale.Fit
                )

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Visual Connections SAC",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Dirección: 12 de Julio 201, San Martín de Porres 15311",
                        style = MaterialTheme.typography.bodyMedium,
                        textAlign = TextAlign.Center
                    )

                    IconButton(
                        onClick = {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://maps.app.goo.gl/HLevAUXAg9LAzPa47"))
                            context.startActivity(intent)
                        }
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = "Abrir ubicación en Google Maps",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }

                    Text(
                        text = "Teléfono: (01) 6360758",
                        style = MaterialTheme.typography.bodyMedium,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Button(
                        onClick = {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.facebook.com/p/Visual-Connections-SAC-100054522846899/"))
                            context.startActivity(intent)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF015D8C))
                    ) {
                        Text("Visítanos en Facebook", color = Color.White)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Sobre nosotros",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )

                Text(
                    text = "Visual Connections SAC es una empresa líder en soluciones de telecomunicaciones. Nos especializamos en el diseño e implementación de sistemas eficientes, asegurando la satisfacción de nuestros clientes con un equipo experto y dedicado.",
                    style = MaterialTheme.typography.bodyMedium,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )

                Spacer(modifier = Modifier.height(16.dp))

                TextButton(onClick = {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://vconnections.pe/"))
                    context.startActivity(intent)
                }) {
                    Text("Visita nuestro sitio web", color = MaterialTheme.colorScheme.primary)
                }

                Spacer(modifier = Modifier.weight(1f))

                Button(
                    onClick = { showDialog.value = true },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF015D8C)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                ) {
                    Text("Cerrar sesión", color = Color.White)
                }
            }
        }
    )

    if (showDialog.value) {
        AlertDialog(
            onDismissRequest = { showDialog.value = false },
            title = { Text("Confirmar cierre de sesión") },
            text = { Text("¿Estás seguro de que deseas cerrar sesión?") },
            confirmButton = {
                Button(onClick = {
                    logout(context)
                    showDialog.value = false
                    onLogoutSuccess() // Llamada para navegar a la pantalla de login
                }) {
                    Text("Cerrar sesión")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDialog.value = false }) {
                    Text("Cancelar")
                }
            }
        )
    }
}

private fun logout(context: android.content.Context) {
    // Limpiar cookies, especialmente para appwinforce.win.pe
    val cookieManager = CookieManager.getInstance()
    cookieManager.removeAllCookies(null)
    cookieManager.removeSessionCookies(null)
    cookieManager.flush()

    // Limpiar cookies específicamente para el dominio de appwinforce.win.pe
    cookieManager.setCookie("https://appwinforce.win.pe", "")
    cookieManager.setCookie("https://accesoventas.win.pe", "")

    Toast.makeText(context, "Sesión cerrada exitosamente", Toast.LENGTH_SHORT).show()
}