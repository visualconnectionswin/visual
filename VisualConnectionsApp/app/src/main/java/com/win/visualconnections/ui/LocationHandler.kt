//LocationHandler.kt

package com.win.visualconnections
import android.content.Intent
import android.net.Uri
import android.util.Log

class LocationHandler {
    companion object {
        private const val TAG = "LocationHandler"
        private var coordinates: Pair<Double, Double>? = null
        // Añadir un timestamp para identificar actualizaciones
        private var lastUpdateTimestamp: Long = 0

        fun handleLocationIntent(intent: Intent): Boolean {
            val data: Uri? = intent.data

            // Log para verificar el Intent recibido
            Log.d(TAG, "handleLocationIntent - Intent recibido: $intent")
            Log.d(TAG, "handleLocationIntent - URI: $data")

            data?.let {
                // Obtener el valor de la URI completa
                val uriString = it.toString()
                Log.d(TAG, "handleLocationIntent - URI completa: $uriString")

                try {
                    // Limpiar coordenadas previas antes de procesar nuevas
                    // ESTA LIMPIEZA AQUÍ ES CORRECTA para evitar arrastrar coordenadas
                    // de un intent MUY anterior si llega uno nuevo.
                    clearCoordinates() // Se mantiene la limpieza aquí

                    when {
                        // Manejo de URIs "geo:latitude,longitude"
                        uriString.startsWith("geo:") -> {
                            val geoParams = uriString.substring(4).split("?").first()
                            val latLng = geoParams.split(",")
                            if (latLng.size >= 2) {
                                val latitude = latLng[0].toDoubleOrNull()
                                val longitude = latLng[1].toDoubleOrNull()
                                if (latitude != null && longitude != null) {
                                    coordinates = Pair(latitude, longitude)
                                    lastUpdateTimestamp = System.currentTimeMillis()
                                    Log.d(TAG, "Geo URI - Lat: $latitude, Lon: $longitude, Timestamp: $lastUpdateTimestamp")
                                    return true
                                } else {
                                    Log.e(TAG, "Error convirtiendo coordenadas geo a double")
                                }
                            } else {
                                Log.e(TAG, "Formato geo inválido: no hay suficientes componentes")
                            }
                        }
                        // Manejo de URLs de Google Maps
                        uriString.contains("maps.google.com") -> {
                            // Intenta extraer los parámetros q= que contienen las coordenadas
                            val qParam = uriString.substringAfter("q=", "")
                            // Intenta extraer del path si q= no funciona (ej. maps.google.com/maps?ll=lat,lon)
                            val llParam = uriString.substringAfter("ll=", "").substringBefore("&")

                            val coordsString = when {
                                qParam.isNotEmpty() && qParam != uriString && qParam.contains(",") -> qParam.substringBefore("&")
                                llParam.isNotEmpty() && llParam.contains(",") -> llParam
                                else -> ""
                            }

                            if (coordsString.isNotEmpty()) {
                                val delimiter = if (coordsString.contains("%2C")) "%2C" else ","
                                val parts = coordsString.split(delimiter)
                                if (parts.size >= 2) {
                                    val latitude = parts[0].toDoubleOrNull()
                                    val longitude = parts[1].toDoubleOrNull()
                                    if (latitude != null && longitude != null) {
                                        coordinates = Pair(latitude, longitude)
                                        lastUpdateTimestamp = System.currentTimeMillis()
                                        Log.d(TAG, "GMaps URL - Lat: $latitude, Lon: $longitude, Timestamp: $lastUpdateTimestamp")
                                        return true
                                    } else {
                                        Log.e(TAG, "Error convirtiendo coordenadas de URL a double")
                                    }
                                } else {
                                    Log.e(TAG, "Formato de coordenadas en URL inválido")
                                }
                            } else {
                                Log.e(TAG, "No se encontraron coordenadas reconocibles (q= o ll=) en la URL de Maps: $uriString")
                            }
                        }

                        else -> {
                            Log.e(TAG, "Formato de URI no reconocido: $uriString")
                        }
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error extrayendo coordenadas: ${e.message}", e)
                }
            }

            Log.w(TAG, "No se pudieron extraer coordenadas del Intent")
            return false
        }

        fun getCoordinates(): Pair<Double, Double>? {
            Log.d(TAG, "getCoordinates() llamado, devolviendo: $coordinates (timestamp: $lastUpdateTimestamp)")
            return coordinates
        }

        fun getLastUpdateTimestamp(): Long {
            return lastUpdateTimestamp
        }

        // MODIFICACIÓN: Asegurarse de que realmente limpia y añade logs claros
        fun clearCoordinates() {
            Log.d(TAG, "clearCoordinates() llamado. Coordenadas ANTES: $coordinates (timestamp: $lastUpdateTimestamp)")
            if (coordinates != null) {
                coordinates = null
                // No resetear el timestamp aquí, CoberturaScreen lo usa para saber si consumió las últimas
                Log.d(TAG, "clearCoordinates(). Coordenadas DESPUÉS: $coordinates")
            } else {
                Log.d(TAG, "clearCoordinates(). Coordenadas ya eran null.")
            }
        }
    }
}