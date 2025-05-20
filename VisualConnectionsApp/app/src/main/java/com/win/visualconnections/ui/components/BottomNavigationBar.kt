//BottomNavigationBar.kt
package com.win.visualconnections.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.navigation.NavController
import androidx.navigation.compose.currentBackStackEntryAsState

@Composable
fun BottomNavigationBar(navController: NavController) {
    NavigationBar(containerColor = Color(0xFF015D8C)) {
        val items = listOf(
            "Home" to Icons.Default.Home,
            "Score" to Icons.Default.Person,
            "Cobertura" to Icons.Default.LocationOn,
            "Status" to Icons.Default.Info
        )
        val currentRoute = navController.currentBackStackEntryAsState().value?.destination?.route

        items.forEach { (screen, icon) ->
            NavigationBarItem(
                icon = {
                    Icon(icon, contentDescription = screen, tint = if (currentRoute == screen.lowercase()) Color(
                        0xFFE0FBFC
                    ) else Color(0xFF737284))
                },
                label = { Text(screen, color = if (currentRoute == screen.lowercase()) Color(
                    0xFFE0FBFC
                ) else Color(0xFF737284)) },
                selected = currentRoute == screen.lowercase(),
                colors = NavigationBarItemDefaults.colors(
                    indicatorColor = Color(0xFFFF5A00)
                ),
                onClick = {
                    navController.navigate(screen.lowercase()) {
                        launchSingleTop = true
                        restoreState = true
                    }
                }
            )
        }
    }
}
