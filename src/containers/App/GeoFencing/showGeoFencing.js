import { Service } from '#config/service';
import { colors } from '#res/colors';
import { getRegionForCoordinates, isIOS } from '#util/index';
import { getFonts } from '#util/';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Polygon } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { Platform } from 'react-native';

const ShowGeoFencing = ({ navigation, route }) => {

    const passingData = route?.params?.passingData;

    const [currentRegion, setCurrentRegion] = useState({
        latitude: 24.8005035,
        longitude: 67.065124,
        latitudeDelta: 0.7000,
        longitudeDelta: 0.7000,
    });
    const [isRectangle, setIsRectangle] = useState(passingData?.FenceType === 'Polygon' ? true : false);
    const [editing, setEditing] = useState(null);
    const [radius, setRadius] = useState(0);
    const mapRef = useRef(null);

    useEffect(() => {
        getGeoFencingDetailsHandler();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getGeoFencingDetailsHandler = async () => {
        try {
            const { Message, Data } = await Service.getDetailsGeoFencing(passingData.ID);
            if (passingData?.FenceType === 'Polygon') {
                setIsRectangle(true);
                let array = [];
                for (const index in Data[0]?.Data) {
                    const { Latitude, Longitude } = Data[0]?.Data[index];
                    console.log('file: showGeoFencing.js => line 74 => getGeoFencingDetailsHandler => Latitude, Longitude', Latitude, Longitude);
                    array.push({ latitude: Latitude, longitude: Longitude });
                }
                let updatedCenter = getRegionForCoordinates(array);
                mapRef.current.animateToRegion(updatedCenter, 1000);
                setEditing({ coordinates: array });
            }
            else if (Message === 'OK') {
                setRadius(Data[0]?.Radius);
                setCurrentRegion({ ...currentRegion, latitude: Data[0]?.Data[0]?.Latitude, longitude: Data[0]?.Data[0]?.Longitude });
                mapRef.current.animateToRegion({
                    latitude: Data[0]?.Data[0]?.Latitude,
                    longitude: Data[0]?.Data[0]?.Longitude,
                    latitudeDelta: 0.2000,
                    longitudeDelta: 0.2000,
                }, 1000);
                setIsRectangle(false);
            }
        } catch (_err) {
            console.log('Inside Catch 68 => ', _err);
        }
    };

    return (
        <View style={styles.root}>
            {
                isRectangle ?
                    <MapView
                        provider="google"
                        mapPadding={{
                            left: responsiveWidth(10),
                            right: responsiveWidth(10),
                        }}
                        ref={mapRef}
                        style={styles.mapStyle}
                        initialRegion={currentRegion}
                        mapType="standard"
                        followUserLocation={true}
                    >
                        {editing && (
                            <Polygon
                                key={editing.id}
                                coordinates={editing.coordinates}
                                holes={editing.holes}
                                strokeColor="rgba(52, 52, 52, 0.2)"
                                fillColor={colors.primaryLight}
                                strokeWidth={3}
                                geodesic={true}
                            />
                        )}
                    </MapView>
                    :
                    <>
                        <MapView
                            provider="google"
                            mapPadding={{
                                left: responsiveWidth(10),
                                right: responsiveWidth(10),
                            }}
                            ref={mapRef}
                            style={styles.mapStyle}
                            initialRegion={currentRegion}
                            mapType="standard"
                            followUserLocation={true}
                        >
                            <MapView.Circle
                                center={currentRegion}
                                radius={radius}
                                fillColor={colors.primaryLight}
                                strokeColor="rgba(52, 52, 52, 0.2)"
                                strokeWidth={3}
                                lineCap="square"
                                lineJoin="miter"
                                geodesic={true}
                            />
                            <MapView.Marker
                                coordinate={{
                                    latitude: parseFloat(currentRegion.latitude),
                                    longitude: parseFloat(currentRegion.longitude),
                                }}
                                pinColor={colors.warning}
                            />
                        </MapView>
                    </>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    mapStyle: {
        width: '100%',
        flex: 1,
        borderRadius: 10,
    },
    bottomContainer: {
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor: colors.white,
        overflow: 'hidden',
        zIndex: 2,
        position: 'absolute',
        bottom: responsiveHeight(0),
        right: responsiveWidth(0),
        left: responsiveWidth(0),
        paddingHorizontal: responsiveHeight(2),
        paddingTop: responsiveHeight(2),
    },
    input: {
        borderWidth: 0.5,
        borderColor: colors.black,
        padding: 2,
        color: colors.black,
        marginVertical: responsiveHeight(0.2),
        paddingHorizontal: 15,
        fontFamily: getFonts().medium,
        borderRadius: 2,
        paddingVertical: isIOS() ? responsiveHeight(1.5) : responsiveHeight(0.9)
    },
    row: {
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
    buttonContainer: {
        overflow: 'hidden',
        zIndex: 2,
        position: 'absolute',
        top: responsiveHeight(0),
        right: responsiveWidth(0),
        left: responsiveWidth(0),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor: colors.white,
        paddingVertical: 10,
    },
    circleSize: {
        position: 'absolute',
        top: 10,
        zIndex: 1,
        right: 10,
    },
    marker: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -12,
        marginTop: -24,
        zIndex: 2,
    },
});

export default ShowGeoFencing;
