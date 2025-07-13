import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, Alert, StyleSheet } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import Clipboard from '@react-native-clipboard/clipboard';

const TokenScreen: React.FC = () => {
    const [fcmToken, setFcmToken] = useState<string | null>(null);

    useEffect(() => {
        const fetchToken = async () => {
            const token = await messaging().getToken();
            setFcmToken(token);
        };
        fetchToken();
    }, []);

    const copyToClipboard = () => {
        if (fcmToken) {
            Clipboard.setString(fcmToken);
            Alert.alert('Copied!', 'FCM Token copied to clipboard.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                Firebase Cloud Messaging Token:
            </Text>
            <TextInput
                value={fcmToken || 'Loading token...'}
                editable={false}
                multiline
                style={styles.input}
            />
            <Button title="Copy Token" onPress={copyToClipboard} disabled={!fcmToken} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    label: { fontSize: 16, textAlign: 'center', marginBottom: 10 },
    input: { padding: 10, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, backgroundColor: '#fff', color: '#333', marginBottom: 10, textAlignVertical: 'top' }
});

export default TokenScreen;