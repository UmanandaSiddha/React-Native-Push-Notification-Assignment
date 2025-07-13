import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationContextType {
    count: number;
    increment: () => void;
    reset: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        // Load initial count from storage
        const loadCount = async () => {
            const storedCount = await AsyncStorage.getItem('notification_count');
            setCount(Number(storedCount) || 0);
        };
        loadCount();
    }, []);

    const increment = async () => {
        const newCount = count + 1;
        setCount(newCount);
        await AsyncStorage.setItem('notification_count', String(newCount));
    };

    const reset = async () => {
        setCount(0);
        await AsyncStorage.setItem('notification_count', '0');
    };

    return (
        <NotificationContext.Provider value={{ count, increment, reset }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};