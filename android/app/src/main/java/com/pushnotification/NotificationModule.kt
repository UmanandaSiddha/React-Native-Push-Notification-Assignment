package com.pushnotification

    import android.app.NotificationChannel
    import android.app.NotificationManager
    import android.app.PendingIntent
    import android.content.Context
    import android.content.Intent
    import android.net.Uri
    import android.os.Build
    import android.widget.RemoteViews
    import androidx.core.app.NotificationCompat
    import com.facebook.react.bridge.ReactApplicationContext
    import com.facebook.react.bridge.ReactContextBaseJavaModule
    import com.facebook.react.bridge.ReactMethod

    class NotificationModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

        override fun getName() = "NotificationModule"

        companion object {
            const val CHANNEL_ID = "call_channel_id"
            const val CHANNEL_NAME = "Incoming Calls"
        }

        init {
            createNotificationChannel()
        }

        private fun createNotificationChannel() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channel = NotificationChannel(
                    CHANNEL_ID,
                    CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Channel for incoming call notifications"
                }
                val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                notificationManager.createNotificationChannel(channel)
            }
        }

        @ReactMethod
        fun showCallNotification(title: String, message: String) {
            val notificationId = System.currentTimeMillis().toInt()

            // --- Intent for Deep Linking (tapping the notification body) ---
            val deepLinkUri = Uri.parse("pushnotification://call/$title/$message")
            val deepLinkIntent = Intent(Intent.ACTION_VIEW, deepLinkUri, reactContext, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
            }
            val deepLinkPendingIntent = PendingIntent.getActivity(
                reactContext,
                notificationId, // Use unique request code
                deepLinkIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            // --- Intents for Notification Actions ---
            val acceptIntent = Intent(reactContext, NotificationActionReceiver::class.java).apply {
                action = "ACCEPT_ACTION"
                putExtra("NOTIFICATION_ID", notificationId)
            }
            val acceptPendingIntent = PendingIntent.getBroadcast(reactContext, notificationId + 1, acceptIntent, PendingIntent.FLAG_IMMUTABLE)

            val declineIntent = Intent(reactContext, NotificationActionReceiver::class.java).apply {
                action = "DECLINE_ACTION"
                putExtra("NOTIFICATION_ID", notificationId)
            }
            val declinePendingIntent = PendingIntent.getBroadcast(reactContext, notificationId + 2, declineIntent, PendingIntent.FLAG_IMMUTABLE)

            // --- Create the Custom RemoteViews ---
            val customLayout = RemoteViews(reactContext.packageName, R.layout.incoming_call_notification).apply {
                setTextViewText(R.id.notification_title, title)
                setTextViewText(R.id.notification_message, message)
                setOnClickPendingIntent(R.id.accept_button, acceptPendingIntent)
                setOnClickPendingIntent(R.id.decline_button, declinePendingIntent)
            }

            // --- Build the Notification ---
            val notification = NotificationCompat.Builder(reactContext, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setStyle(NotificationCompat.DecoratedCustomViewStyle())
                .setCustomContentView(customLayout)
                .setCustomBigContentView(customLayout) // For expanded view
                .setContentIntent(deepLinkPendingIntent) // Set the deep link intent
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setOngoing(true) // Makes it a persistent notification, like a call
                .setAutoCancel(true) // Cancels when deep link is tapped
                .build()

            val notificationManager = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.notify(notificationId, notification)
        }
    }