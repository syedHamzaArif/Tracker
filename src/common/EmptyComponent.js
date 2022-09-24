import React from 'react';
import { View } from 'react-native';
import Typography from './Typography';

const EmptyComponent = ({ title, loading }) => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="bold" style={{ color: 'black', fontSize: 20 }}>
                {title}
            </Typography>
        </View>
    );
};

export default EmptyComponent;
