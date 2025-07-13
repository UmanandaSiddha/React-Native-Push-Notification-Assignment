import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../../App';

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProps>();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Push Notification App</Text>
            <Text style={styles.subtitle}>Ready to receive notifications.</Text>
            <View style={styles.buttonContainer}>
                <Button
                    title="View Notification History"
                    onPress={() => navigation.navigate('History')}
                />
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
    buttonContainer: { width: '80%' }
});

export default HomeScreen;