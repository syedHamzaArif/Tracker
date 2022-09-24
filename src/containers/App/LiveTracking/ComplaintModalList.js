import { colors } from '#res/colors';
import { hitSlop } from '#util/';
import { responsiveHeight } from '#util/responsiveSizes';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import Button from '#common/Button';
import Typography from '#common/Typography';
import { Checkbox } from 'react-native-paper';

const _keyExtractor = (item, index) => `cars${index.toString()}`;

const ComplaintModalList = ({ pressHandler, data, heading, selected, setSelected }) => {

    const setSelectedHandler = (item) => {
        const isAlreadySelected = selected.some(sel => sel.RegNumber === item.RegNumber);
        if (isAlreadySelected) {
            const filtered = selected.filter(sel => sel.RegNumber !== item.RegNumber);
            setSelected(filtered);
        } else {
            setSelected(_selected => [..._selected, item]);
        }
    };

    const ModalList = ({ item, index }) => {
        const isSelected = selected.some(_item => _item.RegNumber === item.RegNumber);
        return (
            <TouchableOpacity
                style={styles.ModalView}
                onPress={setSelectedHandler.bind(this, item)}
                hitSlop={hitSlop}
            >
                <Typography variant="medium" style={{ paddingVertical: 10 }}>
                    {item.Value ? item.Value : item.RegNumber}
                </Typography>
                <Checkbox.Android
                    status={isSelected ? 'checked' : 'unchecked'}
                    color={colors.primary}
                />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.root}>
            <Typography variant="bold"
                style={{ marginHorizontal: 10, marginTop: 10 }}>
                {heading}
            </Typography>
            <FlatList
                data={data}
                showsVerticalScrollIndicator={false}
                renderItem={ModalList}
                keyExtractor={_keyExtractor}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1 }}
                style={{ maxHeight: responsiveHeight(60) }}
            />
            <Button onPress={pressHandler.bind(this, selected?.length ? selected : [])}
                style={styles.button} title="Select"
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
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderBottomColor: colors.gray,
        borderBottomWidth: 0.6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    root: {
        backgroundColor: colors.background,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderRadius: 12,
        // flex: 1,
    },
    button: {
        width: '60%',
        alignSelf: 'center',
        height: 40,
        marginVertical: responsiveHeight(2),
    },
    scrollRoot: {
        flexGrow: 1,
    },
});

export default ComplaintModalList;
