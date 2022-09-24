import { vendorColors } from '#res/colors';
import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

const Loader = (props) => {
    return (
        <View style={styles.root}>
            <ActivityIndicator size={26} color={vendorColors.PRIMARY} />
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        justifyContent: 'center',
        alignItems: 'center',
        ...StyleSheet.absoluteFill,
        backgroundColor: '#eee',
        zIndex: 0,
        opacity: 0.6,
        // flex: 1,
    },
});

export default Loader;
