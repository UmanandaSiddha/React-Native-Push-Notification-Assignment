package com.pushnotification

    import com.facebook.react.bridge.ReactApplicationContext
    import com.facebook.react.bridge.ReactContextBaseJavaModule
    import com.facebook.react.bridge.ReactMethod

    class NotificationModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

        override fun getName() = "NotificationModule"

        @ReactMethod
        fun showCallNotification(title: String, message: String) {
            NotificationHelper.showCallNotification(reactContext, title, message)
        }
    }