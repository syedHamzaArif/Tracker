import images from '#assets/';
import Modal from '#common/Modal';
import Typography from '#common/Typography';
import { Service } from '#config/service';
import { colors } from '#res/colors';
import { getFonts } from '#util/';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import { useFocusEffect } from '@react-navigation/core';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Platform, Animated, Easing } from 'react-native';
import { Icon } from 'react-native-elements';
import MapView, { AnimatedRegion, Marker } from 'react-native-maps';
import { useSelector } from 'react-redux';
import KeepAwake from 'react-native-keep-awake';
import signalr from 'react-native-signalr';
import { server } from '../../../../axios';

const SingleCustomer = ({ navigation, route }) => {

    const headerName = route.params?.headerName;
    const TrackerID = route.params?.TrackerID;
    const paramsOrigin = route.params?.currentRegion;

    let initialRegion = {
        latitude: paramsOrigin?.latitude ?? 24.8005035,
        longitude: paramsOrigin?.longitude ?? 67.065124,
        latitudeDelta: 100,
        longitudeDelta: 100,
    };

    // const [currentRegion, setCurrentRegion] = useState({
    //     latitude: paramsOrigin?.latitude ?? 24.8005035,
    //     longitude: paramsOrigin?.longitude ?? 67.065124,
    //     latitudeDelta: 100,
    //     longitudeDelta: 100,
    // });
    const [liveData, setLiveData] = useState('');
    const [mapType, setMapType] = useState('1');
    const [isMapType, setIsMapType] = useState(false);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const mounted = useRef(true);

    const { userData: { AccountID, UserTypeID } } = useSelector(state => state.userReducer);

    let animatedMarkerCoordinates = useRef(new AnimatedRegion({
        latitude: paramsOrigin ? paramsOrigin?.latitude : 24.8005035,
        longitude: paramsOrigin ? paramsOrigin?.longitude : 67.065124,
        longitudeDelta: 0.030,
        latitudeDelta: 0.030,
    })).current;

    const spinValue = useRef(new Animated.Value(0)).current;  // Initial value for opacity: 0

    // First set up animation
    Animated.timing(
        spinValue,
        {
            toValue: 1,
            duration: 3000,
            easing: Easing.linear, // Easing is an additional import from react-native
            useNativeDriver: true,  // To make use of native driver for performance
        }
    ).start();

    useEffect(() => {
        Animated.loop(
            Animated.timing(
                spinValue,
                {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }
            )
        ).start();
    }, [spinValue]);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: headerName,
        });
    }, [headerName, navigation]);

    useEffect(() => {
        KeepAwake.activate();
    }, []);


    useFocusEffect(
        useCallback(
            () => {
                getLiveLocationDataFirstTime();

                const connection = signalr.hubConnection(server);
                connection.logging = true;
                const proxy = connection.createHubProxy('notificationHub');

                proxy.on('GetLiveTrackingData', (model) => {
                    getLiveLocation(model.Data);
                });

                connection.start({ jsonp: true }).done(async () => {
                    proxy.invoke('helloServer', 'Hello Server, how are you?')
                        .done((directResponse) => {
                        }).fail((_error) => {
                            console.trace('file: SingleCustomer.js => line 104 => done => _error', _error);
                        });
                }).fail(() => {
                    console.trace('Failed');
                });

                //connection-handling
                connection.connectionSlow(() => {
                    console.trace('We are currently experiencing difficulties with the connection.');
                });

                connection.disconnected(async () => {
                    if (!mounted.current) return;
                    setTimeout(function () {
                        connection.start({ jsonp: true })
                            .done()
                            .fail();
                    }, 5000); // Restart connection after 5 seconds.
                });

                connection.error((error) => {
                    const errorMessage = error.message;
                    let detailedError = '';
                    if (error.source && error.source._response) {
                        detailedError = error.source._response;
                    }
                    if (detailedError === 'An SSL error has occurred and a secure connection to the server cannot be made.') {
                        console.trace('When using react-native-signalr on ios with http remember to enable http in App Transport Security https://github.com/olofd/react-native-signalr/issues/14');
                    }
                    console.trace('SignalR error: ' + errorMessage);
                });
                return () => { mounted.current = false; connection.stop(); };
            },
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [],
        )
    );

    const getLiveLocationDataFirstTime = async () => {
        const obj = TrackerID ? {
            AccountID: TrackerID ? '' : AccountID,
            TrackerIDs: [TrackerID],
        } : {
            AccountID: AccountID,
        };
        try {
            const { Data } = await Service.liveTracking(obj);
            if (Data) {
                setLiveData(Data[0]?.Data[0]);
                markerAnimationHandler(Data[0]?.Data?.[0].Lat, Data[0]?.Data?.[0].Long);
            }
            else {
            }
        } catch (error) {
            // setNoNetworkModalVisible(true);
            console.trace('Inside Catch => ', error);
        }
    };

    const getLiveLocation = (_data) => {
        const Data = UserTypeID === '2' ? _data[0].Data.filter(item => item.TrackerID === TrackerID) : _data[0].Data.filter(item => item.AccID === AccountID);

        if (!Data) return;

        if (JSON.stringify(liveData) === JSON.stringify(Data)) return;

        let updatedDataItem = Data[0];
        if (TrackerID) {
            updatedDataItem = Data.find(item => item.RegNumber === headerName);
        }

        setLiveData(updatedDataItem);
        getLocationHandler(updatedDataItem.Lat, updatedDataItem.Long, updatedDataItem.IgnitionStatus);
    };

    const markerAnimationHandler = (latitude, longitude) => {
        let markerCoords = {
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.0090,
            longitudeDelta: 0.0090,
        };
        Platform.OS === 'android' ?
            markerRef.current.animateMarkerToCoordinate({
                markerCoords,
            }, 0)
            :
            animatedMarkerCoordinates.timing({
                markerCoords,
                duration: 0,
                useNativeDriver: false,
            }).start();
        mapRef.current.animateToRegion(markerCoords, 1000);
    };

    const getLocationHandler = async (latitude, longitude, IgnitionStatus) => {
        try {
            if (latitude) {
                let markerCoords = {
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.0090,
                    longitudeDelta: 0.0090,
                };
                Platform.OS === 'android' ?
                    markerRef.current.animateMarkerToCoordinate({
                        latitude: latitude,
                        longitude: longitude,
                    }, 1000)
                    :
                    animatedMarkerCoordinates.timing({
                        latitude: latitude,
                        longitude: longitude,
                        duration: 1000,
                        useNativeDriver: false,
                    }).start();
                mapRef.current.animateToRegion(markerCoords, 1000);
                // markerRef.current.animateMarkerToCoordinate(markerCoords, 1000);
            }
        } catch (_error) {
            console.trace('file: SingleCustomer.js => line 336 => getLocationHandler => _error', _error);
        }
    };

    return (
        <View style={styles.root}>

            <MapView
                provider="google"
                ref={mapRef}
                style={styles.mapStyle}
                initialRegion={initialRegion}
                optimizeWaypoints={true}
                // mapType="terrain"
                mapType={mapType === '1' ? 'standard' : mapType === '2' ? 'hybrid' : mapType === '3' ? 'terrain' : 'standard'}
                showsMyLocationButton
                mapPadding={{ bottom: responsiveHeight(30) }}
            >
                <Marker.Animated
                    ref={markerRef}
                    coordinate={animatedMarkerCoordinates}
                    anchor={{ x: 0.5, y: 0.5 }}
                    title={liveData?.RegNumber}
                    pinColor="red"
                >
                    <Animated.Image source={images.routeStart}
                        style={{
                            width: 40, height: 40,
                            transform: [{
                                rotate: liveData ? `${liveData?.Direction}deg` : '0deg',
                            }],
                        }}
                        resizeMode="contain"
                    />
                </Marker.Animated>
            </MapView>
            <View style={styles.actionBar}>
                <TouchableOpacity
                    onPress={() => setIsMapType(true)}
                    activeOpacity={0.8} style={styles.currentLocation}  >
                    <Icon name="map-check" type="material-community" color={colors.black} size={25} />
                </TouchableOpacity>
            </View>
            <View style={styles.bottomContainer}>
                <View style={[styles.row, {
                    backgroundColor: colors.background,
                    borderBottomColor: colors.textSecondary,
                    borderBottomWidth: 0.2,
                    justifyContent: 'space-between',
                }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 0 }}>
                        <Image source={images.blackCar} resizeMode="contain"
                            style={{ width: responsiveWidth(10), height: responsiveWidth(10) }} />
                        <View style={{ paddingHorizontal: 20 }}>
                            <Typography size={16} variant="bold">{liveData?.RegNumber}</Typography>
                            <Typography size={14} color={colors.textSecondary} variant="small">{liveData?.Maker} {liveData?.Model}</Typography>
                        </View>
                    </View>
                    <Image source={images.alarmButton} resizeMode="contain"
                        style={{ width: responsiveWidth(10), height: responsiveWidth(10) }} />
                </View>
                {/* <View style={[styles.row, {
                    borderBottomColor: colors.textSecondary,
                    borderBottomWidth: 0.2,
                }]}>
                    <Image source={images.Oval} resizeMode="contain"
                        style={{ width: 20, height: 20 }} />
                    <View style={{ paddingHorizontal: 20 }}>
                        <Typography lineHeight={28} size={12} color={colors.textSecondary} variant="medium">LAST LOCATION</Typography>
                        <Typography size={13} variant="bold">{lastLocation}</Typography>
                    </View>
                </View> */}
                <View style={[styles.row, { justifyContent: 'space-between', alignItems: 'center' }]}>
                    <View>
                        <Typography lineHeight={36} size={12} color={colors.textSecondary} variant="medium">ENGINE STATUS</Typography>
                        <Typography align="center" variant="bold">{liveData ? liveData.IgnitionStatus : ''}</Typography>
                    </View>
                    <View>
                        <Typography lineHeight={36} size={12} color={colors.textSecondary} variant="medium">SPEED</Typography>
                        <Typography align="center" variant="bold">{liveData ? `${liveData.Speed === 0 ? '-' : `${liveData.Speed} km`}` : '-'} </Typography>
                    </View>
                    <View>
                        <Typography lineHeight={36} size={12} color={colors.textSecondary} variant="medium">LAST UPDATED</Typography>
                        <Typography align="center" variant="bold">{liveData ? liveData?.LastUpdatedForWeb : '-'}</Typography>
                    </View>
                </View>
                {/* <Modal
                    onBackdropPress={() => { }}
                    setVisible={setNoNetworkModalVisible}
                    visible={noNetworkModalVisible}
                    animationIn="fadeIn"
                    animationOut="fadeOut"
                >
                    <NoInternet
                        internetConnectionHandler={getLiveLocation}
                        cancelHandler={() => setNoNetworkModalVisible(false)}
                        title="Something went wrong"
                    />
                </Modal> */}
                {/* ************* MAap type modal ************ */}
                <Modal
                    setVisible={setIsMapType}
                    visible={isMapType}
                    style={styles.modal}
                >
                    <Typography variant="bold" style={{ paddingBottom: 15 }}>Map Type</Typography>
                    <View style={[styles.rowModal]}>
                        <TouchableOpacity activeOpacity={0.7} onPress={() => {
                            setMapType('1');
                            setIsMapType(false);
                        }}
                            style={{ borderColor: colors.primary, borderWidth: mapType === '1' ? 3 : 0, borderRadius: 12 }}
                        >
                            <Image source={images.default} resizeMode="contain"
                                style={{ width: responsiveWidth(15), height: responsiveWidth(15) }} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.7} onPress={() => {
                            setMapType('2');
                            setIsMapType(false);
                        }}
                            style={{ borderColor: colors.primary, borderWidth: mapType === '2' ? 3 : 0, borderRadius: 12 }}
                        >

                            <Image source={images.Satellite} resizeMode="contain"
                                style={{ width: responsiveWidth(15), height: responsiveWidth(15) }} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.7} onPress={() => {
                            setMapType('3');
                            setIsMapType(false);
                        }}
                            style={{ borderColor: colors.primary, borderWidth: mapType === '3' ? 3 : 0, borderRadius: 12 }}
                        >
                            <Image source={images.Terrain} resizeMode="contain"
                                style={{ width: responsiveWidth(15), height: responsiveWidth(15) }} />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.rowModal]}>
                        <Typography align="center" style={{ width: '33%' }}>Default</Typography>
                        <Typography align="center" style={{ width: '33%' }}>Satellite</Typography>
                        <Typography align="center" style={{ width: '33%' }}>Terrain</Typography>
                    </View>
                </Modal>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    mapStyle: {
        ...StyleSheet.absoluteFill,
        width: '100%',
        flex: 1,
        borderRadius: 10,
    },
    bottomContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor: colors.white,
        borderRadius: 12,
        marginHorizontal: 10,
        overflow: 'hidden',
        zIndex: 2,
        position: 'absolute',
        bottom: responsiveHeight(5),
        right: responsiveWidth(1),
        left: responsiveWidth(1),
        paddingBottom: responsiveHeight(1),
    },
    input: {
        borderWidth: 0.5,
        borderColor: colors.black,
        padding: 2,
        color: colors.black,
        marginVertical: 10,
        paddingHorizontal: 15,
        fontFamily: getFonts().medium,
    },
    row: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: responsiveHeight(1.5),
        alignItems: 'center',
    },
    rowModal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    button: {
        width: '46%',
        paddingVertical: 10,
        alignItems: 'center',
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        backgroundColor: colors.primary,
        elevation: 5,
        padding: 10,
        borderRadius: 8,
    },
    actionBar: {
        position: 'absolute',
        top: 25,
        right: 10,
    },
    currentLocation: {
        backgroundColor: colors.white,
        borderRadius: 50,
        padding: responsiveFontSize(1.2),
    },
    modal: {
        position: 'absolute',
        top: 110,
        right: 10,
        // height: responsiveHeight(10),
        margin: 10,
        width: '60%',
        backgroundColor: colors.background,
        padding: 10,
        borderRadius: 12,
    },
});

export default SingleCustomer;
