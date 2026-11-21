
package com.vijay15july.EfilingApp

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.uimanager.ViewManager

import com.google.android.play.core.integrity.IntegrityManagerFactory
import com.google.android.play.core.integrity.StandardIntegrityManager
import com.google.android.play.core.integrity.StandardIntegrityManager.PrepareIntegrityTokenRequest
import com.google.android.play.core.integrity.StandardIntegrityManager.StandardIntegrityTokenProvider
import com.google.android.play.core.integrity.StandardIntegrityManager.StandardIntegrityTokenRequest

class PlayIntegrityPackage : ReactPackage {

    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> {
        return listOf(PlayIntegrityModule(reactContext))
    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> {
        return emptyList()
    }
}

class PlayIntegrityModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    private val integrityManager =
        IntegrityManagerFactory.createStandard(reactContext)

    @Volatile
    private var tokenProvider: StandardIntegrityTokenProvider? = null

    override fun getName(): String = "PlayIntegrity"

    @ReactMethod
    fun prepareProvider(cloudProjectNumber: String, promise: Promise) {
        val projectNumber = cloudProjectNumber.toLongOrNull()

        if (projectNumber == null || projectNumber <= 0) {
            promise.reject("INVALID_PROJECT_NUMBER", "Invalid Google Cloud project number.")
            return
        }

        val request = PrepareIntegrityTokenRequest.builder()
            .setCloudProjectNumber(projectNumber)
            .build()

        integrityManager.prepareIntegrityToken(request)
            .addOnSuccessListener { provider ->
                tokenProvider = provider
                promise.resolve(true)
            }
            .addOnFailureListener { error ->
                promise.reject("INTEGRITY_PREPARE_FAILED", error.message, error)
            }
    }

    @ReactMethod
    fun requestToken(requestHash: String, promise: Promise) {
        if (requestHash.isBlank()) {
            promise.reject("INVALID_REQUEST_HASH", "Request hash cannot be empty.")
            return
        }

        val provider = tokenProvider

        if (provider == null) {
            promise.reject("PROVIDER_NOT_READY", "Prepare the provider first.")
            return
        }

        val request = StandardIntegrityTokenRequest.builder()
            .setRequestHash(requestHash)
            .build()

        provider.request(request)
            .addOnSuccessListener { response ->
                promise.resolve(response.token())
            }
            .addOnFailureListener { error ->
                promise.reject("INTEGRITY_TOKEN_FAILED", error.message, error)
            }
    }
}