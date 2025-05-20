// MainActivity.kt

package com.win.visualconnections
import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.win.visualconnections.ui.CoberturaScreen
import com.win.visualconnections.ui.HomeScreen
import com.win.visualconnections.ui.LoadingScreen
import com.win.visualconnections.ui.LoginScreen
import com.win.visualconnections.ui.ScoreScreen
import com.win.visualconnections.ui.SettingsScreen
import com.win.visualconnections.ui.SplashScreen
import com.win.visualconnections.ui.StatusScreen
import com.win.visualconnections.ui.WelcomeScreen
import com.win.visualconnections.ui.components.AppBar
import com.win.visualconnections.ui.components.BottomNavigationBar
import com.win.visualconnections.util.JavaScriptFetcher
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
class MainActivity : ComponentActivity() {
    private var startedFromLocationIntent = false
    private var locationIntentCounter = 0
    private val PERMISSION_REQUEST_CODE = 123

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d("MainActivity", "onCreate: Iniciando MainActivity")

        window.statusBarColor = 0xFF015D8C.toInt()
        window.navigationBarColor = 0xFF015D8C.toInt()

        handleIntent(intent)
        requestPermissionsIfNecessary()

        // Primera comprobación al crear la actividad
        lifecycleScope.launch {
            Log.d("MainActivity", "onCreate: Iniciando comprobación de JS desde lifecycleScope")
            JavaScriptFetcher.checkForUpdates(applicationContext)
            Log.d("MainActivity", "onCreate: Comprobación de JS completada desde lifecycleScope")
        }

        setContent {
            VisualConnectionsApp(
                startedFromLocationIntent,
                locationIntentCounter
            )
        }
    }

    override fun onResume() {
        super.onResume()
        // Comprobación cada vez que la actividad vuelve al primer plano
        lifecycleScope.launch {
            Log.d("MainActivity", "onResume: Iniciando comprobación de JS")
            JavaScriptFetcher.checkForUpdates(applicationContext)
            Log.d("MainActivity", "onResume: Comprobación de JS completada")
        }
    }

    private fun requestPermissionsIfNecessary() {
        val permissionsToRequest = mutableListOf<String>()
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.ACCESS_FINE_LOCATION)
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.READ_EXTERNAL_STORAGE)
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.WRITE_EXTERNAL_STORAGE)
        }

        if (permissionsToRequest.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, permissionsToRequest.toTypedArray(), PERMISSION_REQUEST_CODE)
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                Log.i("MainActivity", "Todos los permisos solicitados fueron concedidos.")
            } else {
                Log.w("MainActivity", "Algunos permisos fueron denegados.")
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        LocationHandler.clearCoordinates()
        val wasFromLocationIntent = handleIntent(intent)
        if (wasFromLocationIntent) {
            locationIntentCounter++
            startedFromLocationIntent = true
        }
    }

    private fun handleIntent(intent: Intent?): Boolean {
        intent?.let {
            if (it.action == Intent.ACTION_VIEW && (it.data?.toString()?.contains("maps.google.com") == true ||
                        it.data?.scheme == "geo")) {
                startedFromLocationIntent = LocationHandler.handleLocationIntent(it)
                return startedFromLocationIntent
            }
        }
        return false
    }
}
@Composable
fun VisualConnectionsApp(
    startedFromLocationIntent: Boolean = false,
    locationIntentCounter: Int = 0
) {
    val context = LocalContext.current // Obtener contexto aquí
    val navController = rememberNavController()
    var userLoggedIn by remember { mutableStateOf(false) }
    val hasSeenWelcomeScreen = remember { mutableStateOf(getWelcomeScreenSeen(context)) }
    var isSettingsScreen by remember { mutableStateOf(false) }
    val coroutineScope = rememberCoroutineScope()
    LaunchedEffect(startedFromLocationIntent, locationIntentCounter) {
        Log.d("VisualConnectionsApp", "LaunchedEffect: startedFromLocationIntent=$startedFromLocationIntent, counter=$locationIntentCounter")
        if (startedFromLocationIntent) {
            userLoggedIn = true // Asumimos que si viene de un intent, el usuario ya está/debería estar logueado
            hasSeenWelcomeScreen.value = true // Marcamos como vista la bienvenida

            // Lógica de navegación para 'cobertura'
            if (navController.currentBackStackEntry?.destination?.route == "cobertura") {
                Log.d("VisualConnectionsApp", "Navegando a refresh y luego a cobertura (ya estaba en cobertura)")
                navController.navigate("refresh") { // Ruta temporal para forzar recomposición
                    popUpTo("cobertura") { inclusive = true }
                }
                delay(50) // Pequeño delay para asegurar que la navegación se complete
                navController.navigate("cobertura")
            } else {
                Log.d("VisualConnectionsApp", "Navegando a cobertura (no estaba en cobertura)")
                navController.navigate("cobertura") {
                    popUpTo(navController.graph.startDestinationId) { inclusive = true } // Limpia el stack hasta el inicio
                }
            }
        }
    }

    Scaffold(
        topBar = {
            if (userLoggedIn && !isSettingsScreen) {
                AppBar(
                    title = "Visual Connections",
                    onSettingsClick = {
                        isSettingsScreen = true
                        navController.navigate("settings")
                    }
                )
            }
        },
        bottomBar = {
            if (userLoggedIn && !isSettingsScreen) {
                BottomNavigationBar(navController = navController)
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            NavigationGraph(
                navController = navController,
                userLoggedIn = userLoggedIn,
                hasSeenWelcomeScreen = hasSeenWelcomeScreen.value,
                onLogin = {
                    userLoggedIn = true
                    setWelcomeScreenSeen(context, true)
                    if (!startedFromLocationIntent) {
                        Log.d("VisualConnectionsApp", "onLogin: Navegando a home")
                        navController.navigate("home") {
                            popUpTo(navController.graph.startDestinationId) { inclusive = true }
                        }
                    } else {
                        Log.d("VisualConnectionsApp", "onLogin: Venía de intent, no se navega explícitamente aquí (ya manejado)")
                    }
                },
                onSettingsBack = {
                    isSettingsScreen = false
                    navController.popBackStack()
                },
                onLogout = {
                    userLoggedIn = false
                    isSettingsScreen = false
                },
                startDestination = if (startedFromLocationIntent && userLoggedIn) "cobertura" else "splash",
                locationIntentCounter = locationIntentCounter
            )
        }
    }
}
@Composable
fun NavigationGraph(
    navController: NavHostController,
    userLoggedIn: Boolean,
    hasSeenWelcomeScreen: Boolean,
    onLogin: () -> Unit,
    onSettingsBack: () -> Unit,
    onLogout: () -> Unit,
    startDestination: String = "splash",
    locationIntentCounter: Int = 0
) {
    Log.d("NavigationGraph", "Componiendo con startDestination: $startDestination, userLoggedIn: $userLoggedIn, hasSeenWelcome: $hasSeenWelcomeScreen")
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable("splash") {
            SplashScreen(
                userLoggedIn = userLoggedIn,
                hasSeenWelcomeScreen = hasSeenWelcomeScreen,
                onNavigateToWelcome = { navController.navigate("welcome") { popUpTo("splash") { inclusive = true } } },
                onNavigateToLogin = { navController.navigate("login") { popUpTo("splash") { inclusive = true } } }
            )
        }
        composable("welcome") {
            WelcomeScreen(onNavigateToLogin = { navController.navigate("login") { popUpTo("welcome") { inclusive = true } } })
        }
        composable("loading") {
            LoadingScreen()
            LaunchedEffect(Unit) {
                delay(1000)
                navController.navigate("login") {
                    popUpTo("loading") { inclusive = true }
                }
            }
        }
        composable("login") {
            LoginScreen(onLoginSuccess = onLogin)
        }
        composable("home") {
            if (userLoggedIn) HomeScreen() else { }
        }
        composable("score") {
            if (userLoggedIn) ScoreScreen() else { }
        }
        composable("cobertura") {
            if (userLoggedIn) {
                androidx.compose.runtime.key(locationIntentCounter) {
                    CoberturaScreen()
                }
            }
        }
        composable("status") {
            if (userLoggedIn) StatusScreen() else { }
        }
        composable("settings") {
            SettingsScreen(
                onBackClick = onSettingsBack,
                onLogoutSuccess = {
                    onLogout()
                    navController.navigate("login") {
                        popUpTo(navController.graph.startDestinationId) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            )
        }
        composable("refresh") {
            LoadingScreen()
        }
    }
}
fun getWelcomeScreenSeen(context: Context): Boolean {
    val sharedPref = context.getSharedPreferences("app_preferences", Context.MODE_PRIVATE)
    return sharedPref.getBoolean("hasSeenWelcomeScreen", false)
}
fun setWelcomeScreenSeen(context: Context, hasSeen: Boolean) {
    val sharedPref = context.getSharedPreferences("app_preferences", Context.MODE_PRIVATE)
    with(sharedPref.edit()) {
        putBoolean("hasSeenWelcomeScreen", hasSeen)
        apply()
    }
}