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
    import com.google.firebase.messaging.FirebaseMessagingService
    import com.google.firebase.messaging.RemoteMessage

    class MyFirebaseMessagingService : FirebaseMessagingService() {

        override fun onMessageReceived(remoteMessage: RemoteMessage) {
            super.onMessageReceived(remoteMessage)

            val title = remoteMessage.notification?.title
            val body = remoteMessage.notification?.body

            if (title != null && body != null) {
                showCallNotification(title, body)
            }
        }

        private fun showCallNotification(title: String, message: String) {
            val channelId = "call_channel_id"
            val channelName = "Incoming Calls"
            val notificationId = System.currentTimeMillis().toInt()

            // Create Notification Channel
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channel = NotificationChannel(channelId, channelName, NotificationManager.IMPORTANCE_HIGH).apply {
                    description = "Channel for incoming call notifications"
                }
                val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                notificationManager.createNotificationChannel(channel)
            }

            // Intents
            val deepLinkUri = Uri.parse("pushnotification://call/$title/$message")
            val deepLinkIntent = Intent(Intent.ACTION_VIEW, deepLinkUri, this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
            }
            val deepLinkPendingIntent = PendingIntent.getActivity(this, notificationId, deepLinkIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

            val acceptIntent = Intent(this, NotificationActionReceiver::class.java).apply {
                action = "ACCEPT_ACTION"
                putExtra("NOTIFICATION_ID", notificationId)
            }
            val acceptPendingIntent = PendingIntent.getBroadcast(this, notificationId + 1, acceptIntent, PendingIntent.FLAG_IMMUTABLE)

            val declineIntent = Intent(this, NotificationActionReceiver::class.java).apply {
                action = "DECLINE_ACTION"
                putExtra("NOTIFICATION_ID", notificationId)
            }
            val declinePendingIntent = PendingIntent.getBroadcast(this, notificationId + 2, declineIntent, PendingIntent.FLAG_IMMUTABLE)

            // Custom Layout
            val customLayout = RemoteViews(packageName, R.layout.incoming_call_notification).apply {
                setTextViewText(R.id.notification_title, title)
                setTextViewText(R.id.notification_message, message)
                setOnClickPendingIntent(R.id.accept_button, acceptPendingIntent)
                setOnClickPendingIntent(R.id.decline_button, declinePendingIntent)
            }

            // Build Notification
            val notification = NotificationCompat.Builder(this, channelId)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setStyle(NotificationCompat.DecoratedCustomViewStyle())
                .setCustomContentView(customLayout)
                .setCustomBigContentView(customLayout)
                .setContentIntent(deepLinkPendingIntent)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setOngoing(true)
                .setAutoCancel(true)
                .build()

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.notify(notificationId, notification)
        }
    }