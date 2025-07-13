import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { NavigationContainer, RouteProp, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

import HomeScreen from './src/screens/HomeScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import TokenScreen from './src/screens/TokenScreen';
import NotificationHistoryScreen from './src/screens/NotificationHistoryScreen';

// Type definitions
export type RootStackParamList = {
	Home: undefined;
	Notification: { title?: string; body?: string };
	TokenInfo: undefined;
	History: undefined;
};

export type NavigationProps = StackNavigationProp<RootStackParamList>;
export type NotificationScreenRouteProp = RouteProp<RootStackParamList, 'Notification'>;

const Stack = createStackNavigator<RootStackParamList>();
const { NotificationModule } = NativeModules;

// --- Helper function for local storage ---
const storeNotification = async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
	if (remoteMessage.notification) {
		const newNotification = {
			id: remoteMessage.messageId || new Date().toISOString(),
			title: remoteMessage.notification.title || 'No Title',
			body: remoteMessage.notification.body || 'No Body',
			receivedAt: new Date().toISOString()
		};
		const existingNotifications = await AsyncStorage.getItem('notifications');
		const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
		notifications.unshift(newNotification);
		await AsyncStorage.setItem('notifications', JSON.stringify(notifications.slice(0, 50)));
	}
};

// --- Main App Component ---
const App: React.FC = () => {
	const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

	useEffect(() => {
		const setupCloudMessaging = async () => {
			if (Platform.OS === 'android') {
				await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
			}

			// Foreground messages
			messaging().onMessage(async remoteMessage => {
				console.log('Foreground Message:', remoteMessage);
				if (remoteMessage.notification?.title && remoteMessage.notification?.body) {
					await storeNotification(remoteMessage);
					NotificationModule.showCallNotification(
						remoteMessage.notification.title,
						remoteMessage.notification.body
					);
				}
			});

			// Background/Quit state messages handler
			messaging().setBackgroundMessageHandler(async remoteMessage => {
				console.log('Background Message:', remoteMessage);
				await storeNotification(remoteMessage);
			});

			// --- Deep Linking Handlers ---
			// App opened from a quit state
			messaging().getInitialNotification().then(remoteMessage => {
				if (remoteMessage) {
					console.log('Notification caused app to open from quit state:', remoteMessage);
					navigationRef.current?.navigate('Notification', {
						title: remoteMessage.notification?.title,
						body: remoteMessage.notification?.body
					});
				}
			});

			// App opened from background state
			messaging().onNotificationOpenedApp(remoteMessage => {
				console.log('Notification caused app to open from background state:', remoteMessage);
				navigationRef.current?.navigate('Notification', {
					title: remoteMessage.notification?.title,
					body: remoteMessage.notification?.body
				});
			});
		};

		setupCloudMessaging();
	}, []);

	const linking = {
		prefixes: ['pushnotification://'],
		config: {
			screens: {
				Notification: 'call/:title/:body',
			},
		},
	};

	return (
		<NavigationContainer ref={navigationRef} linking={linking}>
			<Stack.Navigator>
				<Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
				<Stack.Screen name="Notification" component={NotificationScreen} />
				<Stack.Screen name="TokenInfo" component={TokenScreen} options={{ title: 'FCM Token' }} />
				<Stack.Screen name="History" component={NotificationHistoryScreen} options={{ title: 'Notification History' }} />
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default App;