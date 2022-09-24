import Button from '#common/Button';
import Typography from '#common/Typography';
import { colors } from '#res/colors';
import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

const LogoutComponent = ({ cancelHandler, pressHandler, loading }) => (
    <View style={styles.root}>
        {
            loading ?
                <ActivityIndicator size={24} color={colors.primary}
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                />
                :
                <>
                    <Typography variant="bold" style={{ padding: 12 }}>
                        Are you sure you want to log out?
                    </Typography>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        <Button style={{ width: '40%', backgroundColor: colors.white }}
                            textStyle={{ color: colors.primary }}
                            title="Cancel" onPress={cancelHandler} />
                        <Button style={{ width: '40%' }} title="Logout" onPress={pressHandler} />
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

export default LogoutComponent;
