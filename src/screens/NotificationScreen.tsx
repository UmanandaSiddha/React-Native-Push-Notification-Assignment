import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { NotificationScreenRouteProp } from '../../App';

const NotificationScreen: React.FC = () => {
    const route = useRoute<NotificationScreenRouteProp>();
    const { title, body } = route.params || {};

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Deep Link Screen</Text>
            <View style={styles.card}>
                <Text style={styles.title}>Received Notification:</Text>
                <Text style={styles.content}>{title || 'No Title'}</Text>
                <Text style={styles.title}>Message:</Text>
                <Text style={styles.content}>{body || 'No Body'}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    card: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 10,
    },
    content: {
        fontSize: 16,
        marginTop: 5,
        color: '#333',
    },
});

export default NotificationScreen;