import images from '#assets/index';
import Button from '#common/Button';
import Typography from '#common/Typography';
import { Service } from '#config/service';
import { colors } from '#res/colors';
import { getFonts, getRegionForCoordinates, width } from '#util/index';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/stack';
import ImageIcon from '#common/ImageIcon';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView } from 'react-native';
import { updatedata } from '#redux/actions/actionCreators';

const screensData = [
    { name: 'Geo Fencing', images: images.home1, navigation: 'Geo Fencing' },
    { name: 'Pre Notify', images: images.home2, navigation: 'Pre-Notification' },
    { name: 'Replay Route', images: images.home3, navigation: 'Replay Route' },
    { name: 'Trips', images: images.home4, navigation: 'My Trips' },
    { name: 'Reports', images: images.home5, navigation: 'Reports' },
    { name: 'Complaints', images: images.home6, navigation: 'Complaints' },
];

const Home = ({ navigation }) => {

    const headerHeight = useHeaderHeight();
    const insets = useSafeAreaInsets();
    const mapRef = useRef(null);

    const [currentRegion, setCurrentRegion] = useState({
        latitude: 24.8005035,
        longitude: 67.065124,
        latitudeDelta: 100,
        longitudeDelta: 100,
    });
    const [liveData, setLiveData] = useState('');
    const [isMultiple, setIsMultiple] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);

    const { userData: { AccountID, UserName, TrackerCategoryArray } } = useSelector(state => state.userReducer);
    const dispatch = useDispatch();
    const updateUserData = (data) => dispatch(updatedata(data));

    const isPolice = AccountID === 3193 ? true : false;
    const [multipleData, setMultipleData] = useState([
        {
            latitude: 51.5063551,
            longitude: 64.4213255,
            latitudeDelta: 4.21,
            longitudeDelta: 4.21,
        },
    ]);
    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <ImageIcon
                    onPress={() => navigation.openDrawer()}
                    source={images.hamburger}
                    imageStyle={{ tintColor: colors.black }}
                    style={{ marginLeft: width * 0.02 }} />
            ),
            headerTitleAlign: 'left',
            headerTitle: (
                <View>
                    <Image source={images.headerLogo}
                        style={{ height: headerHeight - insets.top, width: 100 }}
                        resizeMode="contain" />
                </View>
            ),
        });
    }, [headerHeight, insets.top, navigation]);

    let timer;
    useFocusEffect(
        useCallback(() => {
            notificationCountHandler();
            if (isMapReady) {
                init();
            }
            return () => clearTimeout(timer);

            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isMapReady])
    );

    const init = () => {
        async function execute1(delay) {
            await getLiveLocation();
            timer = setTimeout(() => execute1(delay), delay);
        }
        execute1(5000);
    };

    const notificationCountHandler = async () => {
        try {
            const obj = {
                AccountID: AccountID,
            };
            const { Data } = await Service.getNotificationList(obj);
            if (Data) {
                const count = Data[0]?.BatteryCount + Data[0]?.TowingCount + Data[0]?.GeoFenceCount;
                let updateUserCount = { name: 'notificationCount', value: { count } };
                updateUserData(updateUserCount);
            }
        } catch (error) {
        }
    };


    const getLiveLocation = async () => {
        try {
            const { Data } = await Service.liveTracking({ AccountID });
            if (Data[0]?.Data.length > 1) {
                setIsMultiple(true);
                await getMultipleLocationHandler(Data[0]?.Data);
            } else {
                setLiveData(Data[0]?.Data[0]);
                getLocationHandler(Data[0]?.Data?.[0].Lat, Data[0]?.Data?.[0].Long);
            }
        } catch (error) {
        } finally {
        }
    };

    const getLocationHandler = async (latitude, longitude) => {
        try {
            if (latitude) {
                setCurrentRegion({
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.0070,
                    longitudeDelta: 0.0070,
                });
                mapRef.current.animateToRegion({
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.0070,
                    longitudeDelta: 0.0070,
                }, 1000);
            }
        } catch (_error) {
            console.trace('Login -> _er', _error);
        } finally {
        }
    };

    const getMultipleLocationHandler = _data => {
        try {
            let updatedLocation = [];
            for (const key in _data) {
                const { Lat: latitude, Long: longitude, AGRN, Maker, Speed, IgnitionStatus, RegNumber } = _data[key];
                let obj = { latitude, longitude, AGRN, Maker, IgnitionStatus, Speed, RegNumber };
                updatedLocation.push(obj);
            }
            const result = getRegionForCoordinates(updatedLocation);
            updatedLocation = updatedLocation.map(item => ({ ...item, latitudeDelta: result.latitudeDelta, longitudeDelta: result.longitudeDelta }));
            setMultipleData(updatedLocation);
            mapRef.current.animateToRegion(result, 1000);
        } catch (error) {
            console.trace('Inside Catch => ', error);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
            <View>
                <Typography size={24}
                    style={{ marginHorizontal: 5 }} variant="bold">
                    {`Hi ${UserName},`}
                </Typography>
                <Typography size={15}
                    color={colors.textSecondary}
                    style={{ marginHorizontal: 5, fontFamily: getFonts().semiBold }}>
                    Access all your car tracking in one place
                </Typography>
            </View>
            <View style={styles.cards}>
                {
                    screensData.map((item, index) => (
                        <TouchableOpacity activeOpacity={0.8} key={`card${index}`}
                            style={styles.itemContainer}
                            onPress={() => {
                                // item.name === 'Geo Fencing' && TrackerCategoryArray[0].TrackerCategory !== 'Teltonika' ? showPopUpMessage('Geo Fencing', 'Geo Fencing is not supported in your vehicle', 'success') :
                                navigation.navigate(item.navigation);
                            }}>
                            <Image source={item.images} resizeMode="contain"
                                style={{ width: '80%', height: 50 }} />
                            <Typography color={colors.textBody} style={{ marginTop: 10 }} variant="medium" >{item.name}</Typography>
                        </TouchableOpacity>
                    ))
                }
            </View>
            <View style={styles.card} activeOpacity={0.8}>
                <View style={{ overflow: 'hidden', borderRadius: 12, margin: 10 }}>
                    {
                        isMultiple ?
                            <MapView
                                mapPadding={{ bottom: responsiveHeight(5), left: responsiveWidth(5), right: responsiveWidth(5), top: responsiveHeight(10) }}
                                ref={mapRef}
                                style={{ height: responsiveHeight(25) }}
                                initialRegion={multipleData[0]}
                                provider="google"
                                mapType="standard"
                                onMapReady={setIsMapReady.bind(this, true)}
                            >
                                {
                                    multipleData?.map((item, index) => {
                                        const isActive = item.IgnitionStatus === 'ON';
                                        if (item.latitude && item.longitude)
                                            return (
                                                <Marker key={`marker${index}`}
                                                    coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                                                    title={`Vehicle #: ${item?.RegNumber}`}
                                                    description={`${item?.Speed} KM/H`}
                                                    // pinColor={colors.primary}
                                                    pinColor={isActive ? colors.primary : colors.warning}

                                                >
                                                    {!isPolice && <Image source={images.routeStart}
                                                        style={{
                                                            width: 40, height: 40,
                                                            transform: [{
                                                                rotate: liveData ? `${liveData?.Direction}deg` : '0deg',
                                                            }],
                                                        }}
                                                        resizeMode="contain"
                                                    />}
                                                </Marker>
                                            );
                                    })
                                }
                            </MapView> :
                            <MapView
                                ref={mapRef}
                                style={{ height: responsiveHeight(25) }}
                                initialRegion={currentRegion}
                                onMapReady={setIsMapReady.bind(this, true)}
                                provider="google"
                                mapType="standard">
                                <Marker.Animated
                                    coordinate={currentRegion}  >
                                    <Image source={images.routeStart} resizeMode="contain"
                                        style={{
                                            width: 35, height: 35,
                                            transform: [{
                                                rotate: liveData ? `${liveData?.Direction}deg` : '0deg',
                                            }],
                                        }} />
                                </Marker.Animated>
                            </MapView>
                    }
                </View>
                <Button
                    onPress={() => isMultiple ? navigation.navigate('Tracker')
                        : navigation.navigate('My Tracker', {
                            headerName: liveData?.RegNumber, currentRegion,
                        })}
                    //  : Alert.alert('Something went Wrong...!!')}
                    // onPress={() => navigation.navigate('Tracker')}
                    style={{ marginVertical: responsiveHeight(2), marginHorizontal: 10 }} title="LIVE TRACKING" />
            </View>

            <TouchableOpacity style={{ ...styles.panicButton, marginBottom: useSafeAreaInsets().bottom }} activeOpacity={0.7} >
                <Image source={images.alarmIcon} resizeMode="contain"
                    style={{ width: 30, height: 30, marginHorizontal: 10 }} />
                <Typography size={16} variant="bold">Panic Alarm</Typography>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flexGrow: 1,
        paddingHorizontal: responsiveWidth(5),
        justifyContent: 'space-evenly',
        paddingVertical: responsiveHeight(0.5),
        // paddingTop: responsiveHeight(1),
        // paddingBottom: responsiveHeight(1),
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
        // height: 100,
        marginVertical: responsiveHeight(1),
        width: '30%',
        alignItems: 'center',
        borderRadius: 10,
        paddingHorizontal: 4,
        paddingVertical: responsiveHeight(1.4),
    },
    cards: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginVertical: 5,
    },
    marker: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -15,
        marginTop: -28,
    },
    card: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        backgroundColor: 'white',
        elevation: 5,
        marginVertical: 10,
        borderRadius: 12,
    },
    panicButton: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        backgroundColor: 'white',
        elevation: 5,
        alignItems: 'center',
        paddingVertical: 15,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
    },
});
export default Home;
