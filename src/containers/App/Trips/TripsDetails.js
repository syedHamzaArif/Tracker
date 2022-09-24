/* eslint-disable no-unused-vars */
import images from '#assets/index';
import Typography from '#common/Typography';
import { Service } from '#config/service';
import { colors } from '#res/colors';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { getAddressCustomer, getRegionForCoordinates } from '#util/index';
import moment from 'moment';


const TripsDetails = ({ navigation, route }) => {

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
    const [data, setData] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [startLocation, setStartLocation] = useState('');
    const [endLocation, setEndLocation] = useState('');
    const [duration, setDuration] = useState('');
    const mapRef = useRef(null);

    const staticData = {
        CarName: 'BRD-585',
        CompanyName: 'Honda Civic',
        StartDate: 'Mon jan 11, 2019',
        EndDate: 'Mon jan 11, 2019',
        street: '798 Swift village',
        Location: '105 william st, chicago, US',
        Duration: '42 min',
        Distance: '0.2 km',
        LastUpdated: '2 min',
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            title: data?.RegNumber,
        });
    }, [data?.RegNumber, navigation]);

    const TripID = route.params.TripID;
    const headerData = route.params.headerData;


    useEffect(() => {
        getLocationIDWise(TripID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [TripID]);

    const getLocationIDWise = async (_id) => {
        console.log('file: TripsDetails.js => line 63 => getLocationIDWise => _id', _id);
        setIsLoading(true);
        try {
            const { Data } = await Service.getTripsIdWise(_id);
            setData(Data[0]);
            await setDateHandler(Data[0].Duration);
            await getStartLocation(Data[0].TripStartLatitude, Data[0].TripStartLongitude);
            await getEndLocation(Data[0].TripEndLatitude, Data[0].TripEndLongitude);
            const updatedData = Data[0].Data;
            getCurrentLocationHandler(updatedData[0], updatedData[updatedData.length - 1]);
            let updatedTripCoordinates = [];
            for (const key in Data[0].Data) {
                const { Lat: latitude, Long: longitude } = Data[0].Data[key];
                let obj = { latitude, longitude };
                updatedTripCoordinates.push(obj);
            }
            setTripCoordinates(updatedTripCoordinates);
            // if (updatedTripCoordinates.length > 25) {
            //     const tempTripCoordinates = [...updatedTripCoordinates];
            //     const tempTripCoordinatesArray = [];
            //     while (tempTripCoordinates.length > 0) {
            //         let chunk = tempTripCoordinates.splice(0, 25);
            //         tempTripCoordinatesArray.push(chunk);
            //     }
            //     setTripCoordinates(tempTripCoordinatesArray);
            // } else {
            //     setTripCoordinates(updatedTripCoordinates);
            // }
            let updatedCenter = getRegionForCoordinates(updatedTripCoordinates);
            mapRef.current.animateToRegion(updatedCenter, 1000);
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };


    const setDateHandler = (date) => {
        const updateHour = date?.split(':')[0];
        const updateMinute = date?.split(':')[1];
        let updatedDate;
        if (updateHour === '0') {
            updatedDate = `${updateMinute} min`;
            setDuration(updatedDate);
        }
        else {
            updatedDate = `${updateHour} hr ${updateMinute} min`;
            setDuration(updatedDate);
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

    const getStartLocation = async (latitude, longitude) => {
        try {
            const { address } = await getAddressCustomer(latitude, longitude);
            setStartLocation(address);
        } catch (error) {
        }
    };

    const getEndLocation = async (latitude, longitude) => {
        try {
            const { address } = await getAddressCustomer(latitude, longitude);
            setEndLocation(address);
        } catch (error) {
        }
    };

    return (
        <View style={styles.root}>

            <MapView
                // mapPadding={{ bottom: responsiveHeight(50), left: responsiveWidth(5), right: responsiveWidth(5) }}
                provider="google"
                mapPadding={{
                    bottom: responsiveHeight(55),
                    left: responsiveWidth(10),
                    right: responsiveWidth(10),
                    top: responsiveHeight(10),
                }}
                ref={mapRef}
                style={styles.mapStyle}
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
                        style={{ width: 45, height: 45 }}
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
                {/* {
                    Array.isArray(tripCoordinates[0]) ?
                        tripCoordinates.map((item, index) => (
                            <MapViewDirections
                                key={`directions${index}`}
                                origin={{
                                    latitude: parseFloat(startRegion.latitude),
                                    longitude: parseFloat(startRegion.longitude),
                                }}
                                destination={{
                                    latitude: parseFloat(destinationRegion.latitude),
                                    longitude: parseFloat(destinationRegion.longitude),
                                }}
                                waypoints={item}
                                apikey={GOOGLE_MAPS_APIKEY}
                                strokeWidth={3}
                                strokeColor={'#707070'}
                            />
                        ))
                        :
                        <MapViewDirections
                            origin={{
                                latitude: parseFloat(startRegion.latitude),
                                longitude: parseFloat(startRegion.longitude),
                            }}
                            destination={{
                                latitude: parseFloat(destinationRegion.latitude),
                                longitude: parseFloat(destinationRegion.longitude),
                            }}
                            waypoints={tripCoordinates}
                            apikey={GOOGLE_MAPS_APIKEY}
                            strokeWidth={3}
                            strokeColor={'#707070'}
                        />
                } */}


                <Polyline
                    coordinates={tripCoordinates}
                    strokeWidth={3}
                    strokeColor={'#707070'}
                />
            </MapView>
            <View style={[styles.bottomContainer]}>
                {/* *******car Details View****** */}

                <View style={[styles.row, {
                    backgroundColor: colors.background,
                    borderBottomColor: colors.textSecondary,
                    borderBottomWidth: 0.2,
                    justifyContent: 'space-between',
                }]}>
                    {/* <View style={[styles.row, { paddingHorizontal: 0 }]}>
                        <Image source={images.blackCar} resizeMode="contain"
                            style={{ width: 60, height: 60 }} />
                        <View style={{ paddingHorizontal: 20 }}>
                            <Typography size={18} variant="bold">{staticData.CarName}</Typography>
                            <Typography size={14} variant="small">{staticData.CompanyName}</Typography>
                        </View>
                    </View>
                    <Image source={images.alarmButton} resizeMode="contain"
                        style={{ width: 70, height: 70 }} /> */}

                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 0, paddingVertical: responsiveHeight(1) }}>
                        <Image source={images.blackCar} resizeMode="contain"
                            style={{ width: responsiveWidth(15), height: responsiveWidth(15) }} />
                        <View style={{ paddingHorizontal: 20 }}>
                            <Typography size={16} variant="bold">{data?.RegNumber}</Typography>
                            <Typography size={14} color={colors.textSecondary} variant="small">{data?.Maker} {data?.Model}</Typography>
                        </View>
                    </View>
                    <Image source={images.alarmButton} resizeMode="contain"
                        style={{ width: responsiveWidth(10), height: responsiveWidth(15) }} />
                </View>

                {/* *******Car Date View****** */}

                <View style={[styles.row, { paddingVertical: 10 }]}>
                    <Image source={images.notifyIcon} resizeMode="contain"
                        style={{ width: 30, height: 55 }} />
                    <View style={{ paddingHorizontal: 20 }}>
                        <Typography color={colors.textSecondary} size={12} variant="semiBold">START DATE</Typography>
                        <Typography>
                            <Typography size={16} variant="bold">
                                {data?.IgnitionOnTime ? moment(data.IgnitionOnTime).format('DD-MM-YYYY')?.split('T')[0] : '-'}
                            </Typography>
                            <Typography color={colors.textSecondary} size={14} variant="semiBold">
                                {`   ${data?.IgnitionOnTime?.split('T')[1]}`}
                            </Typography>
                        </Typography>
                        <Typography color={colors.textSecondary} size={12} style={{ marginTop: 6 }} variant="semiBold">END DATE</Typography>
                        <Typography>
                            <Typography size={16} variant="bold">
                                {data?.IgnitionOnTime ? moment(data.IgnitionOnTime).format('DD-MM-YYYY')?.split('T')[0] : '-'}
                            </Typography>
                            <Typography color={colors.textSecondary} size={14} variant="semiBold">
                                {`   ${data?.IgnitionOffTime?.split('T')[1]}`}
                            </Typography>
                        </Typography>

                    </View>
                </View>

                {/* *******Car Address View****** */}

                {/* <View style={[styles.row, {
                    paddingVertical: 10,
                    borderBottomColor: colors.gray,
                    borderBottomWidth: 0.6,
                    borderTopColor: colors.gray,
                    borderTopWidth: 0.6,

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
                    justifyContent: 'space-between', paddingVertical: 15,
                    alignItems: 'center',
                }]}>
                    <View style={{ flex: 1 }}>
                        <Typography align="center" color={colors.textSecondary} size={12} variant="semiBold">DURATION</Typography>
                        <Typography align="center" variant="bold">{duration}</Typography>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Typography align="center" color={colors.textSecondary} size={12} variant="semiBold">DISTANCE</Typography>
                        <Typography align="center" variant="bold">{parseFloat(data?.Distance).toFixed(2)} Km</Typography>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Typography align="center" color={colors.textSecondary} size={12} variant="semiBold">AVERAGE SPEED</Typography>
                        <Typography align="center" variant="bold">{data?.AvgSpeed}</Typography>
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
        paddingBottom: responsiveHeight(1),
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
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
});

export default TripsDetails;
