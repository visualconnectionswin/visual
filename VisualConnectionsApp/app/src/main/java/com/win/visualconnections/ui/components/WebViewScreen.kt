// WebViewScreen.kt
package com.win.visualconnections.ui.components

import android.annotation.SuppressLint
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import android.net.http.SslError
import android.os.Build
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.GeolocationPermissions
import android.webkit.JavascriptInterface
import android.webkit.SslErrorHandler
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import java.io.File

private const val TAG_JS_INTERFACE = "JSInterface"
private const val TAG_WEBVIEW = "WebViewScreen"

class JSInterface(private val context: Context) {

    // Método para copiar texto al portapapeles (llamado desde JS)
    @JavascriptInterface
    fun copyCoordinates(text: String) {
        Log.d(TAG_JS_INTERFACE, "Intentando copiar al portapapeles: '$text'")
        try {
            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            val clip = ClipData.newPlainText("Coordinates", text)
            clipboard.setPrimaryClip(clip)
            // Mostrar un Toast corto para confirmar la copia (en el hilo UI)
            Handler(context.mainLooper).post {
                Toast.makeText(context, "Coordenadas copiadas!", Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            Log.e(TAG_JS_INTERFACE, "Error al copiar al portapapeles", e)
            Handler(context.mainLooper).post {
                Toast.makeText(context, "Error al copiar coordenadas", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // Método para recibir logs desde JS (llamado desde JS)
    @JavascriptInterface
    fun log(message: String) {
        // Usamos un tag específico para diferenciar logs de JS
        Log.d("WebViewJSLog", message)
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebViewScreen(
    url: String,
    modifier: Modifier = Modifier,
    userAgent: String = "Mozilla/5.0 (Linux; Android ${Build.VERSION.RELEASE}; ${Build.MODEL}) " +
            "AppleWebKit/537.36 (KHTML, like Gecko) " +
            "Chrome/117.0.0.0 Mobile Safari/537.36",
    onPageStarted: () -> Unit = {},
    onPageFinished: () -> Unit = {},
    onPageLoaded: (String) -> Unit = {},
    onExecuteJavaScript: (webView: WebView) -> Unit = {},
    onSessionExpired: () -> Unit = {}
) {
    val context = LocalContext.current
    var webView: WebView? by remember { mutableStateOf(null) }
    var filePathCallback by remember { mutableStateOf<ValueCallback<Array<Uri>>?>(null) }

    // Actualiza el launcher para usar OpenMultipleDocuments en lugar de GetMultipleContents
    val getContent = rememberLauncherForActivityResult(
        ActivityResultContracts.OpenMultipleDocuments()
    ) { uris ->
        filePathCallback?.onReceiveValue(uris?.toTypedArray() ?: emptyArray())
        filePathCallback = null
    }

    AndroidView(
        factory = { ctx ->
            WebView(ctx).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )

                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    databaseEnabled = true
                    userAgentString = userAgent
                    mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                    loadWithOverviewMode = true
                    useWideViewPort = true
                    setSupportZoom(true)
                    builtInZoomControls = true
                    displayZoomControls = false
                    javaScriptCanOpenWindowsAutomatically = true
                    allowFileAccess = true
                    allowContentAccess = true
                    loadsImagesAutomatically = true
                    setGeolocationEnabled(true)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        safeBrowsingEnabled = true
                    }
                    cacheMode = WebSettings.LOAD_DEFAULT
                    mediaPlaybackRequiresUserGesture = false
                    setGeolocationDatabasePath(ctx.filesDir.path)
                }

                WebView.setWebContentsDebuggingEnabled(true)

                addJavascriptInterface(JSInterface(ctx), "AndroidInterface")

                webViewClient = object : WebViewClient() {
                    override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                        super.onPageStarted(view, url, favicon)
                        Log.d(TAG_WEBVIEW, "Cargando página: ${url ?: "null"}")

                        if (url?.contains("appwinforce.win.pe/login") == true) {
                            Log.d(TAG_WEBVIEW, "Detectada redirección a página de login - Sesión expirada")
                            onSessionExpired()
                        }

                        onPageStarted()
                    }

                    override fun onPageFinished(view: WebView, url: String) {
                        super.onPageFinished(view, url)
                        Log.d(TAG_WEBVIEW, "Página cargada: $url")

                        if (url.contains("appwinforce.win.pe/login")) {
                            Log.d(TAG_WEBVIEW, "Página de login cargada completamente - Sesión expirada")
                            onSessionExpired()
                        }

                        Handler(Looper.getMainLooper()).postDelayed({
                            Log.d(TAG_WEBVIEW, "Ejecutando onExecuteJavaScript para $url...")
                            onExecuteJavaScript(view)
                        }, 500)

                        onPageFinished()
                        onPageLoaded(url)
                    }

                    override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): android.webkit.WebResourceResponse? {
                        if (request?.isForMainFrame == true) {
                            val urlRequested = request.url.toString()
                            if (urlRequested.contains("appwinforce.win.pe/login")) {
                                Log.d(TAG_WEBVIEW, "Interceptada solicitud a página de login: $urlRequested")
                            }
                        }
                        return super.shouldInterceptRequest(view, request)
                    }

                    override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                        super.onReceivedError(view, request, error)
                        if (request?.isForMainFrame == true) {
                            val errorDescription = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) error?.description else "Error desconocido"
                            val errorCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) error?.errorCode else -1
                            val failingUrl = request.url?.toString() ?: "URL desconocida"
                            Log.e(TAG_WEBVIEW, "Error al cargar página principal: $failingUrl, Código: $errorCode, Descripción: $errorDescription")
                            Handler(Looper.getMainLooper()).post {
                                Toast.makeText(context, "Error $errorCode: $errorDescription", Toast.LENGTH_LONG).show()
                            }
                        } else {
                            val failingUrl = request?.url?.toString() ?: "URL recurso desconocida"
                            Log.w(TAG_WEBVIEW, "Error al cargar recurso secundario: $failingUrl")
                        }
                    }

                    override fun onReceivedSslError(view: WebView?, handler: SslErrorHandler?, error: SslError?) {
                        Log.w(TAG_WEBVIEW, "Error SSL detectado: ${error?.toString()}. URL: ${error?.url}")
                        handler?.proceed()
                    }

                    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                        val urlToLoad = request.url.toString()
                        Log.d(TAG_WEBVIEW, "Intentando navegar a: $urlToLoad")

                        if (urlToLoad.contains("appwinforce.win.pe/login")) {
                            Log.d(TAG_WEBVIEW, "Detectada navegación a página de login - Sesión expirada")
                            Handler(Looper.getMainLooper()).post {
                                onSessionExpired()
                            }
                        }

                        return false
                    }
                }

                webChromeClient = object : WebChromeClient() {
                    override fun onGeolocationPermissionsShowPrompt(origin: String?, callback: GeolocationPermissions.Callback?) {
                        Log.i(TAG_WEBVIEW, "Solicitud de permiso de geolocalización para: $origin")
                        callback?.invoke(origin, true, true)
                    }

                    override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                        consoleMessage?.apply {
                            val level = when (messageLevel()) {
                                ConsoleMessage.MessageLevel.ERROR -> "ERROR"
                                ConsoleMessage.MessageLevel.WARNING -> "WARN"
                                ConsoleMessage.MessageLevel.LOG -> "LOG"
                                ConsoleMessage.MessageLevel.TIP -> "TIP"
                                ConsoleMessage.MessageLevel.DEBUG -> "DEBUG"
                                else -> "UNKNOWN"
                            }
                            Log.d("WebViewConsole", "[${level}] ${message()} -- From line ${lineNumber()} of ${sourceId()}")
                        }
                        return true
                    }

                    override fun onShowFileChooser(
                        webView: WebView?,
                        filePathCallbackParam: ValueCallback<Array<Uri>>?,
                        fileChooserParams: FileChooserParams?
                    ): Boolean {
                        Log.d(TAG_WEBVIEW, "onShowFileChooser llamado")
                        if (filePathCallback != null) {
                            filePathCallback?.onReceiveValue(null)
                            filePathCallback = null
                        }
                        filePathCallback = filePathCallbackParam

                        try {
                            val acceptTypes = fileChooserParams?.acceptTypes?.filterNotNull()?.filter { it.isNotEmpty() }
                            val mimeTypes = if (!acceptTypes.isNullOrEmpty()) {
                                acceptTypes.map {
                                    when {
                                        it.equals("image/*", true) -> "image/*"
                                        it.equals("audio/*", true) -> "audio/*"
                                        it.equals("application/pdf", true) -> "application/pdf"
                                        it.equals(".jpeg", true) || it.equals(".jpg", true) -> "image/jpeg"
                                        it.equals(".png", true) -> "image/png"
                                        it.equals(".gif", true) -> "image/gif"
                                        it.equals(".mp3", true) -> "audio/mpeg"
                                        it.equals(".wav", true) -> "audio/wav"
                                        it.equals(".doc", true) || it.equals(".docx", true) -> "application/msword"
                                        it.contains("word", true) -> "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        else -> it
                                    }
                                }.toTypedArray()
                            } else {
                                arrayOf(
                                    "image/*",
                                    "audio/*",
                                    "application/pdf",
                                    "application/msword",
                                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                )
                            }

                            Log.d(TAG_WEBVIEW, "Lanzando selector con tipos: ${mimeTypes.joinToString()}")
                            getContent.launch(mimeTypes)
                            return true
                        } catch (e: Exception) {
                            Log.e(TAG_WEBVIEW, "Error al lanzar selector de archivos", e)
                            filePathCallback?.onReceiveValue(null)
                            filePathCallback = null
                            Toast.makeText(context, "No se puede abrir el selector: ${e.message}", Toast.LENGTH_SHORT).show()
                            return false
                        }
                    }

                    override fun onProgressChanged(view: WebView?, newProgress: Int) {
                        super.onProgressChanged(view, newProgress)
                    }
                }

                setDownloadListener { url, userAgent, contentDisposition, mimetype, contentLength ->
                    val request = android.app.DownloadManager.Request(Uri.parse(url))
                    request.setMimeType(mimetype)

                    val filename = contentDisposition
                        ?.split("filename=")
                        ?.lastOrNull()
                        ?.replace("\"", "")
                        ?.trim()
                        ?.trimEnd(';')
                        ?: Uri.parse(url).lastPathSegment ?: "unknown_file"

                    request.setTitle(filename)
                    request.setDescription("Descargando archivo")
                    request.allowScanningByMediaScanner()
                    request.setNotificationVisibility(android.app.DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)

                    val subFolder = "Visual Connections"
                    val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                    val folder = File(downloadsDir, subFolder)
                    if (!folder.exists()) {
                        folder.mkdirs()
                    }
                    request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "$subFolder/$filename")

                    val downloadManager = ctx.getSystemService(Context.DOWNLOAD_SERVICE) as android.app.DownloadManager
                    downloadManager.enqueue(request)

                    Toast.makeText(ctx, "Descarga iniciada en la carpeta $subFolder...", Toast.LENGTH_SHORT).show()
                }

                loadUrl(url)
            }
        },
        update = { view ->
            Log.d(TAG_WEBVIEW, "AndroidView update block ejecutado.")
            webView = view
        },
        modifier = modifier
    )

    DisposableEffect(Unit) {
        onDispose {
            Log.d(TAG_WEBVIEW, "DisposableEffect onDispose: Destruyendo WebView")
            webView?.destroy()
            webView = null
        }
    }
}
