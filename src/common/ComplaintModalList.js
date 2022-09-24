import { colors } from '#res/colors';
import { hitSlop } from '#util/';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Typography from './Typography';

const ComplaintModalList = ({ pressHandler, data, heading }) => {

    const ModalList = ({ item, index }) => {
        return (
            <TouchableOpacity
                style={styles.ModalView}
                onPress={pressHandler.bind(this, item)}
                hitSlop={hitSlop}
            >
                <Typography variant="medium" style={{ paddingVertical: 10 }}>
                    {item.Value ? item.Value : item.RegNumber}
                </Typography>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.root}>
            <Typography variant="bold" style={{ marginHorizontal: 10, marginTop: 10 }}>
                {heading}
            </Typography>
            <FlatList
                data={data}
                showsVerticalScrollIndicator={false}
                renderItem={ModalList}
                keyExtractor={(item, index) => index.toString()}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    SearchBarModal: {
        borderColor: colors.primary,
        borderWidth: 1,
        borderRadius: 12,
        height: 45,
        marginVertical: 10,
        flexDirection: 'row',
        marginHorizontal: 10,
    },
    ModalView: {
        borderColor: colors.black,
        paddingHorizontal: 10,
    },
    root: {
        backgroundColor: colors.background,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
});

export default ComplaintModalList;
