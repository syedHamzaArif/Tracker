import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import images from '#assets/index';
import Typography from '#common/Typography';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import { colors } from '#res/colors';
import { Service } from '#config/service';
import { useSelector } from 'react-redux';
import EmptyComponent from '#common/EmptyComponent';


const _keyExtractor = (item, index) => `notification${index}${item.id}`;

const MyVehicles = ({ navigation }) => {

    const { userData } = useSelector(state => state.userReducer);
    const [data, setData] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getTrackerIDWiseHandler();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getTrackerIDWiseHandler = async () => {
        setIsLoading(true);
        try {
            const { Data } = await Service.getTrackerIDWise(userData.AccountID);
            setData(Data);
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const _renderItem = ({ item, index }) => {

        return (
            <TouchableOpacity activeOpacity={0.8} style={styles.item} onPress={() => null} >
                <View style={styles.imageView} >
                    <View style={{ padding: 15, flex: 1 }} >
                        <Image source={images.vehicles} style={{ width: 50, height: 50 }}
                            resizeMode="contain" />
                    </View>
                </View>
                <View style={{}} >
                    <Typography variant="bold">{item?.RegNumber}</Typography>
                    <Typography size={14} color={colors.textSecondary} variant="small">{item?.Maker} {item?.Model}</Typography>

                </View>
            </TouchableOpacity>);
    };

    return (
        <>
            {
                isLoading ?
                    <ActivityIndicator
                        color={colors.primary}
                        size={50}
                        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }
                        }
                    />
                    :
                    <FlatList
                        data={data}
                        keyExtractor={_keyExtractor}
                        renderItem={_renderItem}
                        contentContainerStyle={{ flexGrow: 1 }}
                        ListEmptyComponent={<EmptyComponent title="No vehicle Found" />}
                    />
            }
        </>
    );
};

const styles = StyleSheet.create({
    root: {
        flexGrow: 1,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: responsiveHeight(1),
        margin: responsiveHeight(1),
        borderRadius: 12,
        backgroundColor: colors.white,
    },
    imageView: {
        width: responsiveWidth(24),
        height: responsiveWidth(24),
        marginRight: responsiveWidth(2),
    },
});

export default MyVehicles;
