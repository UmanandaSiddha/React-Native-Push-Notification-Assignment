package com.pushnotification

    import com.google.firebase.messaging.FirebaseMessagingService
    import com.google.firebase.messaging.RemoteMessage

    class MyFirebaseMessagingService : FirebaseMessagingService() {

        override fun onMessageReceived(remoteMessage: RemoteMessage) {
            super.onMessageReceived(remoteMessage)
            remoteMessage.notification?.let {
                // Use applicationContext for services
                NotificationHelper.showCallNotification(applicationContext, it.title ?: "No Title", it.body ?: "No Body")
            }
        }
    }