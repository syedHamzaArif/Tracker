import images from '#assets/';
import Typography from '#common/Typography';
import { colors } from '#res/colors';
import { hitSlop } from '#util/';
import React from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { responsiveWidth } from '#util/responsiveSizes';
import LoaderView from '#common/LoaderView';
import EmptyComponent from '#common/EmptyComponent';
import moment from 'moment';

const NoGoAreas = ({ data, isLoading, deleteHandler }) => {


    const renderData = ({ item }) => {
        return (
            <View style={styles.itemContainer}>
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
                        <Typography style={{ marginBottom: 10 }} size={17} variant="bold">{moment(item.FromDate.split('T')[0]).format('DD-MM-YYYY')}</Typography>
                        <Typography color={colors.textSecondary} variant="small">END DATE</Typography>
                        <Typography size={17} variant="bold">{moment(item.ToDate.split('T')[0]).format('DD-MM-YYYY')}</Typography>

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

export default NoGoAreas;

