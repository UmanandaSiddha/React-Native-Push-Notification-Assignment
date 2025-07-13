package com.pushnotification

    import android.R // <-- Import the Android R class
    import android.app.NotificationChannel
    import android.app.NotificationManager
    import android.app.PendingIntent
    import android.content.Context
    import android.content.Intent
    import android.net.Uri
    import android.os.Build
    import androidx.core.app.NotificationCompat

    object NotificationHelper {

        private const val CHANNEL_ID = "call_channel_id"
        private const val CHANNEL_NAME = "Incoming Calls"

        fun createNotificationChannel(context: Context) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channel = NotificationChannel(
                    CHANNEL_ID,
                    CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Channel for incoming call notifications"
                    setBypassDnd(true)
                }
                val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                notificationManager.createNotificationChannel(channel)
            }
        }

        fun showCallNotification(context: Context, title: String, message: String) {
            createNotificationChannel(context) // Ensure channel exists
            val notificationId = System.currentTimeMillis().toInt()

            // Intent for tapping the notification (deep link)
            val deepLinkUri = Uri.parse("pushnotification://call/$title/$message")
            val fullScreenIntent = Intent(Intent.ACTION_VIEW, deepLinkUri, context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
            }
            val fullScreenPendingIntent = PendingIntent.getActivity(context, notificationId, fullScreenIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

            // Intent for "Decline" action
            val declineIntent = Intent(context, NotificationActionReceiver::class.java).apply {
                action = "DECLINE_ACTION"
                putExtra("NOTIFICATION_ID", notificationId)
            }
            val declinePendingIntent = PendingIntent.getBroadcast(context, notificationId + 1, declineIntent, PendingIntent.FLAG_IMMUTABLE)

            // Intent for "Accept" action
            val acceptIntent = Intent(context, NotificationActionReceiver::class.java).apply {
                action = "ACCEPT_ACTION"
                putExtra("NOTIFICATION_ID", notificationId)
            }
            val acceptPendingIntent = PendingIntent.getBroadcast(context, notificationId + 2, acceptIntent, PendingIntent.FLAG_IMMUTABLE)

            // Build the notification using standard action buttons
            val notificationBuilder = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(com.pushnotification.R.mipmap.ic_launcher) // Use app's own launcher icon
                .setContentTitle(title)
                .setContentText(message)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_CALL)
                .setContentIntent(fullScreenPendingIntent)
                .setFullScreenIntent(fullScreenPendingIntent, true) // For pop-up
                .setAutoCancel(true)
                .setOngoing(true)
                // Use android.R to access system icons
                .addAction(R.drawable.ic_menu_close_clear_cancel, "Decline", declinePendingIntent)
                .addAction(R.drawable.ic_menu_call, "Accept", acceptPendingIntent)

            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.notify(notificationId, notificationBuilder.build())
        }
    }