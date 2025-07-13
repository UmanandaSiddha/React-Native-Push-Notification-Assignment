import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNotification } from '../context/NotificationContext';
import { NavigationProps } from '../../App';

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProps>();
    const { count } = useNotification(); // Get the count from context

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Push Notification App</Text>
            <Text style={styles.subtitle}>Ready to receive notifications.</Text>
            <View style={styles.buttonContainer}>
                <View style={styles.buttonWrapper}>
                    <Button
                        title="View Notification History"
                        onPress={() => navigation.navigate('History')}
                    />
                    {count > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{count}</Text>
                        </View>
                    )}
                </View>
                <View style={{ marginVertical: 10 }} />
                <Button
                    title="View FCM Token"
                    onPress={() => navigation.navigate('TokenInfo')}
                    color="#841584"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    subtitle: { fontSize: 16, color: 'gray', marginBottom: 40, textAlign: 'center' },
    buttonContainer: { width: '80%' },
    buttonWrapper: { position: 'relative' },
    badge: { position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
    badgeText: { color: 'white', fontWeight: 'bold' }
});

export default HomeScreen;