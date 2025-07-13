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
import { NotificationProvider, useNotification } from './src/context/NotificationContext';

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

const AppContent: React.FC = () => {
	const { increment } = useNotification();

	// This useEffect runs only once to set up the listeners
	useEffect(() => {
		const setupListeners = async () => {
			await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

			messaging().onMessage(async remoteMessage => {
				if (remoteMessage.notification?.title && remoteMessage.notification?.body) {
					await storeNotification(remoteMessage);
					await increment();
					NotificationModule.showCallNotification(
						remoteMessage.notification.title,
						remoteMessage.notification.body
					);
				}
			});

			messaging().setBackgroundMessageHandler(async remoteMessage => {
				await storeNotification(remoteMessage);
				const storedCount = await AsyncStorage.getItem('notification_count');
				const newCount = (Number(storedCount) || 0) + 1;
				await AsyncStorage.setItem('notification_count', String(newCount));
			});
		};
		setupListeners();
	}, [increment]);

	return (
		<Stack.Navigator>
			<Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
			<Stack.Screen name="Notification" component={NotificationScreen} />
			<Stack.Screen name="TokenInfo" component={TokenScreen} options={{ title: 'FCM Token' }} />
			<Stack.Screen name="History" component={NotificationHistoryScreen} options={{ title: 'Notification History' }} />
		</Stack.Navigator>
	);
};

const App: React.FC = () => {
	const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

	const onReady = () => {
		messaging().getInitialNotification().then(remoteMessage => {
			if (remoteMessage) {
				navigationRef.current?.navigate('Notification', {
					title: remoteMessage.notification?.title,
					body: remoteMessage.notification?.body,
				});
			}
		});

		messaging().onNotificationOpenedApp(remoteMessage => {
			navigationRef.current?.navigate('Notification', {
				title: remoteMessage.notification?.title,
				body: remoteMessage.notification?.body
			});
		});
	};

	return (
		<NotificationProvider>
			<NavigationContainer ref={navigationRef} onReady={onReady}>
				<AppContent />
			</NavigationContainer>
		</NotificationProvider>
	);
};

export default App;