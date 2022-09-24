import Button from '#common/Button';
import Typography from '#common/Typography';
import { colors } from '#res/colors';
import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

const SessionExpired = ({ pressHandler, loading }) => (
    <View style={styles.root}>
        {
            loading ?
                <ActivityIndicator size={24} color={colors.primary}
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                />
                :
                <>
                    <Typography variant="bold" style={{ padding: 12, textAlign: 'center' }}>
                        Your session has expired, Log in again to continue.
        </Typography>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Button style={{ width: '60%' }} title="OK" onPress={pressHandler} />
                    </View>
                </>
        }
    </View>
);
const styles = StyleSheet.create({
    root: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 10,
        paddingVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SessionExpired;
