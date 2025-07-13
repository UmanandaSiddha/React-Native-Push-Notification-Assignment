import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useNotification } from '../context/NotificationContext';

interface Notification {
    id: string;
    title: string;
    body: string;
    receivedAt: string;
}

const NotificationHistoryScreen: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const isFocused = useIsFocused();
    const { reset } = useNotification();

    useEffect(() => {
        const loadNotifications = async () => {
            const storedNotifications = await AsyncStorage.getItem('notifications');
            if (storedNotifications) {
                setNotifications(JSON.parse(storedNotifications));
            }
        };
        if(isFocused){
            loadNotifications();
            reset();
        }
    }, [isFocused, reset]);

    return (
        <View style={styles.container}>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text>{item.body}</Text>
                        <Text style={styles.date}>{new Date(item.receivedAt).toLocaleString()}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>No notification history.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: 'white', marginBottom: 5, borderRadius: 8 },
    title: { fontWeight: 'bold' },
    date: { fontSize: 12, color: 'gray', marginTop: 5 }
});

export default NotificationHistoryScreen;