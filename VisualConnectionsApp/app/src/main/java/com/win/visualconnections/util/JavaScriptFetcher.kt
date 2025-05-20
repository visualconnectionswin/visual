package com.win.visualconnections.util

import android.content.Context
import android.util.Log
import android.widget.Toast
import com.google.gson.Gson
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.IOException

data class JsVersionInfo(val version: Int)

object JavaScriptFetcher {

    private const val TAG = "JavaScriptFetcher"

    // --- Configuración ---
    private const val GITHUB_USER = "visualconnectionswin"
    private const val GITHUB_REPO = "visual"
    private const val GITHUB_BRANCH = "main"

    private const val BASE_RAW_URL = "https://raw.githubusercontent.com/$GITHUB_USER/$GITHUB_REPO/$GITHUB_BRANCH/remote_js"
    private const val VERSION_URL = "$BASE_RAW_URL/version.json"

    // --- Script de Score ---
    private const val SCORE_JS_REMOTE_FILENAME = "score_script.js"
    private const val SCORE_JS_URL = "$BASE_RAW_URL/$SCORE_JS_REMOTE_FILENAME"
    private const val FILENAME_CACHED_SCORE_JS = "cached_score.js"
    internal const val DEFAULT_SCORE_JS_ASSET_PATH = "default_score_script.js"

    // --- Script de Status ---
    private const val STATUS_JS_REMOTE_FILENAME = "status_script.js"
    private const val STATUS_JS_URL = "$BASE_RAW_URL/$STATUS_JS_REMOTE_FILENAME"
    private const val FILENAME_CACHED_STATUS_JS = "cached_status.js"
    internal const val DEFAULT_STATUS_JS_ASSET_PATH = "default_status_script.js"

    // --- Scripts de Cobertura ---
    private const val COBERTURA_GENERIC_JS_REMOTE_FILENAME = "cobertura_generic_script.js"
    private const val COBERTURA_GENERIC_JS_URL = "$BASE_RAW_URL/$COBERTURA_GENERIC_JS_REMOTE_FILENAME"
    private const val FILENAME_CACHED_COBERTURA_GENERIC_JS = "cached_cobertura_generic.js"
    internal const val DEFAULT_COBERTURA_GENERIC_JS_ASSET_PATH = "default_cobertura_generic_script.js"

    private const val COBERTURA_WITH_COORDS_JS_REMOTE_FILENAME = "cobertura_with_coords_script.js"
    private const val COBERTURA_WITH_COORDS_JS_URL = "$BASE_RAW_URL/$COBERTURA_WITH_COORDS_JS_REMOTE_FILENAME"
    private const val FILENAME_CACHED_COBERTURA_WITH_COORDS_JS = "cached_cobertura_with_coords.js"
    internal const val DEFAULT_COBERTURA_WITH_COORDS_JS_ASSET_PATH = "default_cobertura_with_coords_script.js"

    // --- Preferencias ---
    private const val PREFS_NAME = "JsCachePrefs"
    private const val KEY_CACHED_VERSION = "cached_js_version"

    private val client = OkHttpClient()
    private val gson = Gson()

    private suspend fun fetchString(url: String): String? = withContext(Dispatchers.IO) {
        Log.d(TAG, "fetchString: Intentando descargar desde $url")
        try {
            val request = Request.Builder().url(url).build()
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) {
                    Log.e(TAG, "fetchString: Fallo al descargar $url. Código: ${response.code}, Mensaje: ${response.message}")
                    if (response.code == 404) {
                        Log.e(TAG, "fetchString: ¡Archivo no encontrado (404)! Verifica URL y ruta.")
                    }
                    return@withContext null
                }
                val responseBody = response.body?.string()
                if (responseBody.isNullOrBlank() && url.endsWith(".js")) {
                    Log.w(TAG, "fetchString: El JS de $url está vacío.")
                } else if (responseBody.isNullOrBlank()) {
                    Log.w(TAG, "fetchString: El archivo de $url está vacío.")
                }
                Log.i(TAG, "fetchString: Descarga exitosa de $url")
                return@withContext responseBody
            }
        } catch (e: IOException) {
            Log.e(TAG, "fetchString: IOException $url: ${e.message}", e)
            return@withContext null
        } catch (e: Exception) {
            Log.e(TAG, "fetchString: Excepción $url: ${e.message}", e)
            return@withContext null
        }
    }

    private suspend fun saveScriptToFile(context: Context, filename: String, content: String) = withContext(Dispatchers.IO) {
        try {
            val file = File(context.filesDir, filename)
            file.writeText(content)
            Log.i(TAG, "saveScriptToFile: Script guardado en ${file.absolutePath}")
        } catch (e: IOException) {
            Log.e(TAG, "saveScriptToFile: Error guardando $filename: ${e.message}", e)
        }
    }

    private suspend fun loadScriptFromFile(context: Context, filename: String): String? = withContext(Dispatchers.IO) {
        try {
            val file = File(context.filesDir, filename)
            if (file.exists() && file.canRead()) {
                val contentLength = file.length()
                if (contentLength == 0L) {
                    Log.w(TAG, "loadScriptFromFile: Cacheado $filename vacío.")
                    return@withContext null
                }
                val content = file.readText()
                Log.i(TAG, "loadScriptFromFile: Script cargado desde ${file.absolutePath} (Tamaño: $contentLength bytes)")
                return@withContext content
            } else {
                Log.d(TAG, "loadScriptFromFile: Script $filename no encontrado/leíble.")
            }
        } catch (e: IOException) {
            Log.e(TAG, "loadScriptFromFile: Error cargando $filename: ${e.message}", e)
        }
        return@withContext null
    }

    internal suspend fun loadDefaultScriptFromAssets(context: Context, assetPath: String): String? = withContext(Dispatchers.IO) {
        Log.d(TAG, "loadDefaultScriptFromAssets: Cargando desde assets: $assetPath")
        return@withContext try {
            context.assets.open(assetPath).bufferedReader().use { it.readText() }
        } catch (e: IOException) {
            Log.e(TAG, "loadDefaultScriptFromAssets: Error al leer '$assetPath': ${e.message}", e)
            "console.error('Error: Default script from asset $assetPath not found.');"
        }
    }

    suspend fun checkForUpdates(context: Context) = coroutineScope {
        Log.i(TAG, "checkForUpdates: Iniciando comprobación de JS...")
        val remoteVersionJson = fetchString(VERSION_URL)

        if (remoteVersionJson == null) {
            Log.w(TAG, "checkForUpdates: No se pudo obtener 'version.json'. Usando cacheados/default.")
            return@coroutineScope
        }

        val remoteVersionInfo: JsVersionInfo = try {
            gson.fromJson(remoteVersionJson, JsVersionInfo::class.java)
        } catch (e: Exception) {
            Log.e(TAG, "checkForUpdates: Error parseando 'version.json': ${e.message}.", e)
            return@coroutineScope
        }

        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val cachedVersion = prefs.getInt(KEY_CACHED_VERSION, 0)
        Log.i(TAG, "checkForUpdates: Versión Remota: ${remoteVersionInfo.version}, Versión Cacheada: $cachedVersion")

        val scriptsToManage = listOf(
            ScriptInfo("Score", SCORE_JS_URL, FILENAME_CACHED_SCORE_JS, DEFAULT_SCORE_JS_ASSET_PATH),
            ScriptInfo("Status", STATUS_JS_URL, FILENAME_CACHED_STATUS_JS, DEFAULT_STATUS_JS_ASSET_PATH),
            ScriptInfo("CoberturaGeneric", COBERTURA_GENERIC_JS_URL, FILENAME_CACHED_COBERTURA_GENERIC_JS, DEFAULT_COBERTURA_GENERIC_JS_ASSET_PATH),
            ScriptInfo("CoberturaWithCoords", COBERTURA_WITH_COORDS_JS_URL, FILENAME_CACHED_COBERTURA_WITH_COORDS_JS, DEFAULT_COBERTURA_WITH_COORDS_JS_ASSET_PATH)
        )

        var allDownloadsSuccessful = true
        val downloadTasks = mutableListOf<Deferred<Boolean>>()

        if (remoteVersionInfo.version > cachedVersion || cachedVersion == 0) {
            Log.i(TAG, "checkForUpdates: Nueva versión JS (${remoteVersionInfo.version}) o primera ejecución. Descargando scripts...")

            scriptsToManage.forEach { scriptInfo ->
                val task = async(Dispatchers.IO) {
                    Log.d(TAG, "checkForUpdates: Intentando descargar ${scriptInfo.name}...")
                    val cachedFile = File(context.filesDir, scriptInfo.cachedFilename)
                    var scriptSuccess = false
                    if (remoteVersionInfo.version > cachedVersion || cachedVersion == 0 || !cachedFile.exists() || cachedFile.length() == 0L) {
                        if (!cachedFile.exists() || cachedFile.length() == 0L) {
                            Log.w(TAG, "checkForUpdates: Cache para ${scriptInfo.name} no existe o vacío, forzando descarga.")
                        }
                        val scriptContent = fetchString(scriptInfo.remoteUrl)
                        if (scriptContent != null && scriptContent.isNotBlank()) {
                            saveScriptToFile(context, scriptInfo.cachedFilename, scriptContent)
                            Log.i(TAG, "checkForUpdates: ${scriptInfo.name} (v${remoteVersionInfo.version}) descargado y guardado.")
                            scriptSuccess = true
                        } else {
                            Log.e(TAG, "checkForUpdates: Fallo al descargar o JS vacío para ${scriptInfo.name} desde ${scriptInfo.remoteUrl}.")
                            scriptSuccess = false
                        }
                    } else {
                        Log.i(TAG, "checkForUpdates: ${scriptInfo.name} (v$cachedVersion) ya estaba actualizado y presente, no se vuelve a descargar.")
                        scriptSuccess = true
                    }
                    scriptSuccess
                }
                downloadTasks.add(task)
            }

            val results = downloadTasks.awaitAll()
            allDownloadsSuccessful = results.all { it }

            if (allDownloadsSuccessful) {
                prefs.edit().putInt(KEY_CACHED_VERSION, remoteVersionInfo.version).apply()
                Log.i(TAG, "checkForUpdates: TODOS los scripts actualizados. VERSIÓN LOCAL ACTUALIZADA a ${remoteVersionInfo.version}.")
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Funciones de la app actualizadas (v${remoteVersionInfo.version})", Toast.LENGTH_LONG).show()
                }
            } else {
                Log.e(TAG, "checkForUpdates: AL MENOS UN SCRIPT NO PUDO SER DESCARGADO/VALIDADO. La versión cacheada ($cachedVersion) NO se actualizará globalmente.")
            }
        } else {
            Log.i(TAG, "checkForUpdates: Scripts (v$cachedVersion) ya están actualizados (remota: ${remoteVersionInfo.version}).")
        }
    }

    suspend fun getScoreJs(context: Context): String {
        Log.d(TAG, "getScoreJs: Solicitando script de Score...")
        val cachedScript = loadScriptFromFile(context, FILENAME_CACHED_SCORE_JS)
        if (cachedScript != null) {
            logScriptSource(context, "Score", "CACHEADO")
            return cachedScript
        }
        logScriptSource(context, "Score", "POR DEFECTO (assets)")
        showDefaultToast(context, "Score")
        return loadDefaultScriptFromAssets(context, DEFAULT_SCORE_JS_ASSET_PATH)
            ?: "console.error('CRITICAL: Default Score script from asset failed.');"
    }

    suspend fun getStatusJs(context: Context): String {
        Log.d(TAG, "getStatusJs: Solicitando script de Status...")
        val cachedScript = loadScriptFromFile(context, FILENAME_CACHED_STATUS_JS)
        if (cachedScript != null) {
            logScriptSource(context, "Status", "CACHEADO")
            return cachedScript
        }
        logScriptSource(context, "Status", "POR DEFECTO (assets)")
        showDefaultToast(context, "Status")
        return loadDefaultScriptFromAssets(context, DEFAULT_STATUS_JS_ASSET_PATH)
            ?: "console.error('CRITICAL: Default Status script from asset failed.');"
    }

    suspend fun getCoberturaGenericJs(context: Context): String {
        Log.d(TAG, "getCoberturaGenericJs: Solicitando script de Cobertura Genérico...")
        val cachedScript = loadScriptFromFile(context, FILENAME_CACHED_COBERTURA_GENERIC_JS)
        if (cachedScript != null) {
            logScriptSource(context, "CoberturaGenérico", "CACHEADO")
            return cachedScript
        }
        logScriptSource(context, "CoberturaGenérico", "POR DEFECTO (assets)")
        showDefaultToast(context, "Cobertura Genérico")
        return loadDefaultScriptFromAssets(context, DEFAULT_COBERTURA_GENERIC_JS_ASSET_PATH)
            ?: "console.error('CRITICAL: Default Cobertura Genérico script from asset failed.');"
    }

    suspend fun getCoberturaWithCoordsJsTemplate(context: Context): String {
        Log.d(TAG, "getCoberturaWithCoordsJsTemplate: Solicitando template de Cobertura con Coordenadas...")
        val cachedScript = loadScriptFromFile(context, FILENAME_CACHED_COBERTURA_WITH_COORDS_JS)
        if (cachedScript != null) {
            logScriptSource(context, "CoberturaConCoords", "CACHEADO (template)")
            return cachedScript
        }
        logScriptSource(context, "CoberturaConCoords", "POR DEFECTO (assets, template)")
        showDefaultToast(context, "Cobertura con Coordenadas")
        return loadDefaultScriptFromAssets(context, DEFAULT_COBERTURA_WITH_COORDS_JS_ASSET_PATH)
            ?: "console.error('CRITICAL: Default Cobertura con Coordenadas script from asset failed.');"
    }

    private fun logScriptSource(context: Context, scriptName: String, sourceType: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val currentCachedVersion = prefs.getInt(KEY_CACHED_VERSION, 0)
        Log.i(TAG, "get${scriptName}Js: Usando JS de $scriptName $sourceType (versión global en prefs: $currentCachedVersion).")
    }

    private suspend fun showDefaultToast(context: Context, scriptName: String) = withContext(Dispatchers.Main) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val localVersion = prefs.getInt(KEY_CACHED_VERSION, 0)
        val message = if (localVersion == 0) {
            "Usando func. $scriptName por defecto (1ra vez/sin conexión)"
        } else {
            "Error al cargar func. $scriptName cacheadas (v$localVersion). Usando por defecto."
        }
        Toast.makeText(context, message, Toast.LENGTH_LONG).show()
    }

    private data class ScriptInfo(
        val name: String,
        val remoteUrl: String,
        val cachedFilename: String,
        val defaultAssetPath: String
    )
}