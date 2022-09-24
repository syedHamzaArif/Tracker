import { colors } from '#res/colors';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Button from './Button';
import Typography from './Typography';

const DeleteView = ({ cancelHandler, pressHandler }) => {
    return (
        <View style={styles.approvalModal}>
            <Typography variant="bold" style={{ padding: 12, textAlign: 'center' }}>
                Are you sure you want to delete these items?
            </Typography>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                <Button style={{ width: '40%', backgroundColor: colors.white }}
                    textStyle={{ color: colors.primary }}
                    title="Cancel" onPress={cancelHandler} />
                <Button style={{ width: '40%' }} title="Yes"
                    onPress={pressHandler.bind(this, true)} />
            </View>
        </View>);
};

const styles = StyleSheet.create({
    approvalModal: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        paddingVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default DeleteView;
