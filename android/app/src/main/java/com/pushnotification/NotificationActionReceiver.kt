package com.pushnotification

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.core.app.NotificationManagerCompat

class NotificationActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        val notificationId = intent.getIntExtra("NOTIFICATION_ID", 0)

        when (action) {
            "ACCEPT_ACTION" -> {
                Toast.makeText(context, "Call Accepted", Toast.LENGTH_SHORT).show()
                // Here you would add logic to navigate to a call screen
            }
            "DECLINE_ACTION" -> {
                Toast.makeText(context, "Call Declined", Toast.LENGTH_SHORT).show()
            }
        }
        // Dismiss the notification
        val notificationManager = NotificationManagerCompat.from(context)
        notificationManager.cancel(notificationId)
    }
}