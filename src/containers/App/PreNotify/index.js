import images from '#assets/';
import EmptyComponent from '#common/EmptyComponent';
import LoaderView from '#common/LoaderView';
import Typography from '#common/Typography';
import { colors } from '#res/colors';
import { hitSlop } from '#util/';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import moment from 'moment';
import React from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';



const PreNotify = ({ data, isLoading, deleteHandler }) => {

    const renderData = ({ item }) => {
        return (
            <View style={styles.itemContainer}
            >
                <View style={[styles.rowItem, { justifyContent: 'space-between' }]}>
                    <Typography style={{ marginBottom: 10 }} size={17} variant="bold">{item.NotifType}</Typography>
                    <TouchableOpacity hitSlop={hitSlop} activeOpacity={0.8}
                        onPress={deleteHandler.bind(this, item)}
                        style={{ padding: responsiveWidth(1) }}>
                        <Image source={images.delete} resizeMode="contain"
                            style={{ width: 25, height: 25 }} />
                    </TouchableOpacity>
                </View>
                <View style={styles.rowItem}>
                    <Image source={images.notifyIcon} resizeMode="contain"
                        style={{ width: 20, height: 70 }} />
                    <View style={{ paddingHorizontal: 10 }}>
                        <Typography color={colors.textSecondary} variant="small">START DATE</Typography>
                        <Typography>
                            <Typography style={{ marginBottom: 10 }} size={17} variant="bold">{moment(item.FromDate.split('T')[0]).format('DD-MM-YYYY')}</Typography>

                            {/* <Typography style={{ marginBottom: 10 }} size={15} variant="small">  {item.FromDate.split('T')[1]}</Typography> */}
                        </Typography>

                        <Typography color={colors.textSecondary} variant="small">END DATE</Typography>
                        <Typography>
                            <Typography size={17} variant="bold">{moment(item.ToDate.split('T')[0]).format('DD-MM-YYYY')}</Typography>
                            {/* <Typography size={15} variant="small">  {item.ToDate.split('T')[1]}</Typography> */}
                        </Typography>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.root}>
            {
                isLoading ?
                    <LoaderView /> :
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={data}
                        renderItem={renderData}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{ flexGrow: 1 }}
                        ListEmptyComponent={<EmptyComponent title="No Notification Found" />}
                    />
            }
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: responsiveHeight(2),
    },
    itemContainer: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        backgroundColor: 'white',
        elevation: 5,
        margin: 5,
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    rowItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default PreNotify;

