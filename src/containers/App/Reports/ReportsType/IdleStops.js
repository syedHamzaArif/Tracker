/* eslint-disable no-unused-vars */
import images from '#assets/index';
import Typography from '#common/Typography';
import { Service } from '#config/service';
import { colors } from '#res/colors';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { getAddressCustomer, getRegionForCoordinates, hitSlop } from '#util/index';
import { Icon } from 'react-native-elements';


const IdleStops = ({ navigation, route }) => {

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
    const [stopData, setStopData] = useState([]);
    const [data, setData] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [startLocation, setStartLocation] = useState('');
    const [endLocation, setEndLocation] = useState('');
    const [duration, setDuration] = useState('');
    const mapRef = useRef(null);
    const TripID = route.params.TripID;


    useEffect(() => {
        getLocationIDWise(TripID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [TripID]);

    const getLocationIDWise = async (_id) => {
        console.log('file: TripsDetails.js => line 63 => getLocationIDWise => _id', _id);
        setIsLoading(true);
        try {
            const { Data } = await Service.getTripsIdWise(_id);
            console.log('file: IdleStops.js => line 63 => getLocationIDWise => Data[0].IdleStops', Data[0].IdleStops);
            if (Data[0].IdleStops) {
                console.log('if');
                setStopData(Data[0].IdleStops);
            } else {
                console.log('else');
                setStopData([]);
            }
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
            let updatedCenter = getRegionForCoordinates(updatedTripCoordinates);
            mapRef.current.animateToRegion(updatedCenter, 1000);
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };


    const setDateHandler = (date) => {
        const updateHour = date.split(':')[0];
        const updateMinute = date.split(':')[1];
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

    const calloutPressHandler = (_data) => {
        console.log('file: IdleStops.js => line 146 => calloutPressHandler => _data', _data);
        navigation.navigate('Trips Details', { TripID: _data?.TripID });
    };


    return (
        <View style={styles.root}>

            <MapView
                provider="google"
                mapPadding={{ left: responsiveWidth(5), right: responsiveWidth(5) }}
                ref={mapRef}
                style={styles.mapStyle}
                mapType="standard"
                flat={true}
            >
                {/* <MapView.Marker
                    coordinate={{
                        latitude: parseFloat(startRegion.latitude),
                        longitude: parseFloat(startRegion.longitude),
                    }}
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

                <Polyline
                    coordinates={tripCoordinates}
                    strokeWidth={3}
                    strokeColor={'#707070'}
                /> */}
                {
                    stopData?.map((item, index) => {
                        console.log('file: IdleStops.js => line 187 => stopData?.map => item', item.TripID);
                        console.log('file: IdleStops.js => line 187 => stopData?.map => item', item.DurationInMins);
                        const stopDuration = item?.DurationInMins?.toFixed(2);
                        if (item.Lat && item.Lng)
                            return (
                                <MapView.Marker key={`marker${index}`}
                                    coordinate={{ latitude: item.Lat, longitude: item.Lng }}
                                    anchor={{ x: 0.5, y: 0.5 }}
                                    title={`Idle Time: ${stopDuration?.toString()} min`}
                                    onCalloutPress={calloutPressHandler.bind(this, item)}
                                // description={item?.DurationInMins?.toString()}
                                >
                                    <Icon name="primitive-dot" type="octicon" underlayColor="transparent"
                                        color={colors.primary} hitSlop={hitSlop}
                                        size={30}
                                        containerStyle={{ padding: 8, marginLeft: responsiveWidth(2) }}
                                    />
                                </MapView.Marker>
                            );
                    })
                }
            </MapView>

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

export default IdleStops;
