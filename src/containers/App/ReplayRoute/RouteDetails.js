import images from '#assets/index';
import Typography from '#common/Typography';
import { Service } from '#config/service';
import { colors } from '#res/colors';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Animated, Easing } from 'react-native';
import MapView, { AnimatedRegion, Polyline } from 'react-native-maps';
import { getRegionForCoordinates } from '#util/index';
import { Platform } from 'react-native';
import moment from 'moment';

var timer;
const RouteDetails = ({ navigation, route }) => {

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

    const TripID = route.params.TripID;

    const [startRegion, setStartRegion] = useState({
        latitude: 24.8005035,
        longitude: 67.065124,
        latitudeDelta: 0.030,
        longitudeDelta: 0.030,
    });
    const [destinationRegion, setDestinationRegion] = useState({
        latitude: 24.8805035,
        longitude: 67.0852124,
        latitudeDelta: 0.030,
        longitudeDelta: 0.030,
    });
    const [tripCoordinates, setTripCoordinates] = useState([]);
    const [allLocationData, setAllLocationData] = useState([
        {
            latitude: 24.8805035,
            longitude: 67.0852124,
            latitudeDelta: 0.030,
            longitudeDelta: 0.030,
        },
    ]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [data, setData] = useState();
    const [isTripStatus, setIsTripStatus] = useState(true);

    const [angle, setAngle] = useState('');
    const [counter, setCounter] = useState(500);
    const [speed, setSpeed] = useState('');
    const [ignitionStatus, setIgnitionStatus] = useState('');
    const [time, setTime] = useState('');

    let animatedMarkerCoordinates = useRef(new AnimatedRegion({
        latitude: 0,
        longitude: 0,
        longitudeDelta: 0.030,
        latitudeDelta: 0.030,
    })).current;

    const mapRef = useRef(null);
    const markerRef = useRef(null);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: data?.RegNumber,
        });
    }, [navigation, data?.RegNumber]);


    useEffect(() => {
        getLocationIDWise(TripID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [TripID]);

    const getLocationIDWise = async (_id) => {
        try {
            const { Data } = await Service.getTripsIdWise(_id);
            console.log('file: RouteDetails.js => line 101 => getLocationIDWise => Data', Data);
            setData(Data[0]);
            const updatedData = Data[0].Data;
            getCurrentLocationHandler(updatedData[0], updatedData[updatedData.length - 1]);
            let updatedTripCoordinates = [];
            for (const key in Data[0].Data) {
                const { Lat: latitude, Long: longitude, Speed, IgnitionStatus, AddedOn, ServerTime } = Data[0].Data[key];
                let obj = { latitude, longitude, Speed, IgnitionStatus, AddedOn, ServerTime };
                updatedTripCoordinates.push(obj);
            }
            console.log('file: RouteDetails.js => line 116 => getLocationIDWise => updatedTripCoordinates', updatedTripCoordinates);
            setAllLocationData(updatedTripCoordinates);
            setTripCoordinates(updatedTripCoordinates);
            Platform.OS === 'android' ?
                markerRef.current?.animateMarkerToCoordinate({
                    latitude: updatedTripCoordinates[0].latitude,
                    longitude: updatedTripCoordinates[0].longitude,
                }, 0)
                :
                animatedMarkerCoordinates.timing({
                    latitude: updatedTripCoordinates[0].latitude,
                    longitude: updatedTripCoordinates[0].longitude,
                    duration: 0,
                    useNativeDriver: false,
                }).start();
            let updatedCenter = getRegionForCoordinates(updatedTripCoordinates);
            console.log('file: RouteDetails.js => line 127 => getLocationIDWise => updatedCenter', updatedCenter);
            mapRef.current.animateToRegion(updatedCenter, 1000);
        } catch (error) {
            console.log('Inside Catch => ', error);
        }
    };

    const getCurrentLocationHandler = async (_startRegion, _endRegion) => {
        try {
            if (_startRegion.Lat) {
                setStartRegion({
                    latitude: _startRegion.Lat,
                    longitude: _startRegion.Long,
                    latitudeDelta: 0.030,
                    longitudeDelta: 0.030,
                });
                setDestinationRegion({
                    latitude: _endRegion.Lat,
                    longitude: _endRegion.Long,
                    latitudeDelta: 0.030,
                    longitudeDelta: 0.030,
                });
            }
        } catch (_error) {
            console.log('Login -> _error', _error);
        }
    };


    const refreshHandler = () => {
        clearTimeout(timer);
        startStopTrip('start', 0, true, 500);
    };

    const tripIndexHandler = (_type) => {
        clearTimeout(timer);
        if (_type === 'increase') {
            startStopTrip('start', currentIndex + 1, true, 500);
        } else {
            startStopTrip('start', currentIndex - 1, true, 500);
        }
    };

    const tripSpeedHandler = (_type) => {
        let updatedCounter;
        if (_type === 'fast' && counter > 100) {
            clearTimeout(timer);
            updatedCounter = counter - 100;
            setCounter(updatedCounter);
            startStopTrip('start', currentIndex, true, updatedCounter);
        }
        else if (_type === 'slow' && counter < 5000) {
            clearTimeout(timer);
            updatedCounter = counter + 100;
            setCounter(updatedCounter);
            startStopTrip('start', currentIndex, true, updatedCounter);
        }
    };

    const getRotationAngle = (previousPosition, currentPosition) => {
        const x1 = previousPosition.latitude;
        const y1 = previousPosition.longitude;
        const x2 = currentPosition.latitude;
        const y2 = currentPosition.longitude;

        const xDiff = x2 - x1;
        const yDiff = y2 - y1;

        const result = (Math.atan2(yDiff, xDiff) * 180.0) / Math.PI;
        setAngle(result.toString());
        return result;
    };

    const startStopTrip = (type, _refreshIndex, _isTripStatus, _counter) => {

        let updatedStatus = _isTripStatus !== null ? _isTripStatus : isTripStatus;
        let updatedCounter = _counter !== null ? _counter : counter;
        if (updatedStatus) {
            if (type === 'start') {
                let updatedCurrentIndex = _refreshIndex !== null ? _refreshIndex : currentIndex;
                async function execute1(delay, _index) {
                    if (_index > 0 && _index < allLocationData.length - 1) {
                        getRotationAngle(allLocationData[_index - 1], allLocationData[_index]);
                    }
                    if (allLocationData) {
                        setSpeed(allLocationData[_index].Speed);
                        setTime(allLocationData[_index].ServerTime);
                        setIgnitionStatus(allLocationData[_index].IgnitionStatus);
                        mapRef.current.animateToRegion({
                            ...allLocationData[_index],
                            latitudeDelta: 0.0100,
                            longitudeDelta: 0.0100,
                        }, delay);

                        setCurrentIndex(_index);
                        // setTimeout(() => {

                        markerAnimationHandler(
                            allLocationData[_index].latitude,
                            allLocationData[_index].longitude,
                            delay
                        );

                        Platform.OS === 'android' ?
                            markerRef.current.animateMarkerToCoordinate({
                                latitude: allLocationData[_index].latitude,
                                longitude: allLocationData[_index].longitude,
                            }, delay + (delay * 0.5))
                            :
                            animatedMarkerCoordinates.timing({
                                latitude: allLocationData[_index].latitude,
                                longitude: allLocationData[_index].longitude,
                                duration: delay + (delay * 0.5),
                                useNativeDriver: false,
                            }).start();
                        // }, 0);

                        if (updatedCurrentIndex < allLocationData.length) {
                            timer = setTimeout(() => execute1(delay, updatedCurrentIndex++), delay);
                        } else {
                            clearTimeout(timer);
                            // setTimeout(() => {
                            //     markerAnimationHandler(
                            //         allLocationData[0].latitude,
                            //         allLocationData[0].longitude,
                            //         delay
                            //     );
                            //     mapRef.current.animateToRegion({
                            //         ...allLocationData[0],
                            //         latitudeDelta: 0.0100,
                            //         longitudeDelta: 0.0100,
                            //     }, delay);
                            // }, 1200);
                            return;
                        }
                    }
                }
                execute1(updatedCounter, updatedCurrentIndex);
                setIsTripStatus(false);
            }
        }
        else if (type === 'stop') {
            clearTimeout(timer);
            setIsTripStatus(true);
        }
    };

    const markerAnimationHandler = (latitude, longitude, delay) => {
        Platform.OS === 'android' ?
            markerRef.current.animateMarkerToCoordinate({
                latitude, longitude,
            }, delay + (delay * 0.5))
            :
            animatedMarkerCoordinates.timing({
                latitude, longitude,
                duration: delay + (delay * 0.5),
                useNativeDriver: false,
            }).start();
    };

    return (
        <View style={styles.root}>
            <MapView
                provider="google"
                mapPadding={{
                    bottom: responsiveHeight(55),
                    left: responsiveWidth(10),
                    right: responsiveWidth(10),
                    top: responsiveHeight(10),
                }}
                ref={mapRef}
                // style={{ width: '100%', height: responsiveHeight(42), borderRadius: 12 }}
                style={styles.mapStyle}
                initialRegion={allLocationData[0]}
                mapType="standard"
                flat={true}
            >
                <MapView.Marker
                    coordinate={{
                        latitude: parseFloat(startRegion.latitude),
                        longitude: parseFloat(startRegion.longitude),
                    }}
                    title={data?.RegNumber}
                    description={data?.StartAddress}
                >
                    <Image source={images.currentLocation}
                        style={{ width: 40, height: 40 }}
                        resizeMode="contain" />
                </MapView.Marker>
                <MapView.Marker
                    coordinate={{
                        latitude: parseFloat(destinationRegion.latitude),
                        longitude: parseFloat(destinationRegion.longitude),
                    }}
                    title={data?.RegNumber}
                    description={data?.EndAddress}
                >
                    <Image source={images.pinLocation}
                        style={{ width: 60, height: 60 }}
                        resizeMode="contain" />
                </MapView.Marker>
                {allLocationData?.[currentIndex]?.latitude ?
                    <MapView.Marker.Animated
                        ref={markerRef}
                        coordinate={animatedMarkerCoordinates}
                        // coordinate={{
                        //     latitude: parseFloat(allLocationData[currentIndex].latitude),
                        //     longitude: parseFloat(allLocationData[currentIndex].longitude),
                        // }}
                        anchor={{ x: 0.5, y: 0.5 }}
                        pinColor="red"
                    // flat
                    >
                        {/* <View style={{ bottom: -20 }}> */}
                        <Animated.Image source={images.routeStart}
                            style={{
                                width: 40, height: 40,
                                transform: [{
                                    rotate: angle ? `${angle}deg` : '0deg',
                                    // transform: [{ rotate: spin }]
                                }],
                            }}
                            resizeMode="contain" />
                        {/* </View> */}
                    </MapView.Marker.Animated>
                    : null
                }
                <Polyline
                    coordinates={tripCoordinates}
                    strokeWidth={3}
                    strokeColor={'#707070'}
                />

            </MapView>
            <View style={[styles.bottomContainer]}>
                {/* *******Car Date View****** */}

                <View style={[styles.row, {
                    paddingVertical: 10,
                    justifyContent: 'space-around',

                }]}>
                    <View>
                        <Typography color={colors.textSecondary} variant="small">GPS TIME</Typography>
                        <Typography size={24} variant="bold">{time ? time?.split('T')[1]?.split('.')[0] : data?.IgnitionOnTime?.split('T')[1]}</Typography>
                        <Typography color={colors.textSecondary} variant="small">{'Hour    Min      Sec'}</Typography>

                    </View>
                    <View>
                        <Typography color={colors.textSecondary} variant="small">GPS DATE</Typography>
                        <Typography size={24} variant="bold">{time ? moment(time).format('DD-MM-YYYY')?.split('T')[0] : moment(data?.IgnitionOnTime).format('DD-MM-YYYY')?.split('T')[0]}</Typography>
                        <Typography color={colors.textSecondary} variant="small">{'   Day     Month    Year'}</Typography>

                    </View>
                </View>

                {/* *******Start/Stop Button****** */}

                <View style={styles.buttonsView}>
                    <TouchableOpacity onPress={tripIndexHandler.bind(this, 'decrease')}>
                        <Image source={images.left} resizeMode="contain"
                            style={{ width: 30, height: 30 }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={tripIndexHandler.bind(this, 'increase')}>
                        <Image source={images.right} resizeMode="contain"
                            style={{ width: 30, height: 30 }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={refreshHandler}>
                        <Image source={images.refresh} resizeMode="contain"
                            style={{ width: 30, height: 30 }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={tripSpeedHandler.bind(this, 'slow')}>
                        <Image source={images.back} resizeMode="contain"
                            style={{ width: 30, height: 30 }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={startStopTrip.bind(this, 'start', null, null, null)}>
                        <Image source={images.stopButton} resizeMode="contain"
                            style={{ width: 30, height: 30 }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={startStopTrip.bind(this, 'stop', null, null, null)}>
                        <Image source={images.playButton} resizeMode="contain"
                            style={{ width: 30, height: 30 }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={tripSpeedHandler.bind(this, 'fast')}>
                        <Image source={images.fast} resizeMode="contain"
                            style={{ width: 30, height: 30 }} />
                    </TouchableOpacity>

                </View>
                {/* *******Car Address View****** */}

                {/* <View style={[styles.row, {
                    paddingVertical: 5,
                    marginVertical: responsiveHeight(1),
                    borderTopColor: colors.gray,
                    borderBottomColor: colors.gray,
                    borderBottomWidth: 0.2,
                    borderTopWidth: 0.2,
                }]}>
                    <Image source={images.routeIcon} resizeMode="contain"
                        style={{ width: 30, height: 60 }} />
                    <View style={{ paddingHorizontal: 20 }}>
                        <Typography style={{ paddingVertical: 5 }} numberOfLines={2} size={12} variant="bold">{data?.StartAddress}</Typography>
                        <Typography style={{ paddingVertical: 5 }} numberOfLines={2} size={12} variant="bold">{data?.EndAddress}</Typography>
                    </View>
                </View> */}

                {/* *******Car Engine Details View****** */}

                <View style={[styles.row, {
                    justifyContent: 'space-around',
                    alignItems: 'center',
                }]}>
                    <View style={{ alignItems: 'center' }}>
                        <Image source={images.key} resizeMode="contain"
                            style={{ width: 35, height: 35 }} />
                        <Typography align="center" color={colors.textSecondary} variant="small">IGNITION STATUS</Typography>
                        <Typography align="center" variant="bold">{ignitionStatus ? ignitionStatus : 'OFF'}</Typography>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Image source={images.speed} resizeMode="contain"
                            style={{ width: 35, height: 35 }} />
                        <Typography align="center" color={colors.textSecondary} variant="small">SPEED</Typography>
                        {/* <Typography align="center" variant="bold">{tripCoordinates?.Speed} km</Typography> */}
                        <Typography align="center" variant="bold">{`${+speed === 0 ? '-' : `${speed} km`}`}</Typography>

                    </View>

                </View>
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
        // flex: 1,
        borderRadius: 10,
    },
    marker: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -15,
        marginTop: -28,
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
        bottom: responsiveHeight(4),
        right: responsiveWidth(1),
        left: responsiveWidth(1),
        paddingVertical: responsiveHeight(1),
    },
    input: {
        borderWidth: 0.5,
        borderColor: colors.black,
        padding: 2,
        color: colors.black,
        marginVertical: 10,
        paddingHorizontal: 15,
        fontFamily: 'sf-ui-display-Medium',
    },
    row: {
        flexDirection: 'row',
        // justifyContent: 'space-between',
        paddingHorizontal: 20,
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
    buttonsView: {
        borderRadius: 8,
        borderColor: colors.primary,
        borderWidth: 0.5,
        backgroundColor: colors.background,
        marginHorizontal: 25,
        paddingHorizontal: 10,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

});

export default RouteDetails;
