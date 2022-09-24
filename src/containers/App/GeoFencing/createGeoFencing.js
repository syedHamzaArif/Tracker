import images from '#assets/';
import Typography from '#common/Typography';
import { Service } from '#config/service';
import { colors } from '#res/colors';
import { isIOS } from '#util/';
import { showPopUpMessage } from '#util/';
import { getFonts } from '#util/';
import { responsiveHeight } from '#util/responsiveSizes';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Keyboard } from 'react-native';
import { Platform } from 'react-native';
import { KeyboardAvoidingView } from 'react-native';
import { View, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { Icon } from 'react-native-elements';
import MapView, { Polygon } from 'react-native-maps';
import { useSelector } from 'react-redux';

var id = 0;

const CreateGeoFencing = ({ navigation }) => {
    const { userData: { AccountID, TrackerCategoryArray } } = useSelector(state => state.userReducer);

    const [currentRegion, setCurrentRegion] = useState({
        latitude: 24.8005035,
        longitude: 67.065124,
        latitudeDelta: 0.7000,
        longitudeDelta: 0.7000,
    });
    const [isRectangle, setIsRectangle] = useState(TrackerCategoryArray[0].TrackerCategory !== 'Teltonika' ? true : false);
    const [editing, setEditing] = useState(null);
    const [polygons, setPolygons] = useState([]);
    const [creatingHole, setCreatingHole] = useState(false);
    const [radius, setRadius] = useState(20000);
    const [fenceName, setFenceName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [trackerID, setTrackerID] = useState('');
    const [error, setError] = useState('');
    const mapRef = useRef(null);
    const [isKeyboardUp, setIsKeyboardUp] = useState(false);

    useEffect(() => {
        getTrackerIDWiseHandler();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    useEffect(() => {
        const _keyboardUp = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardUp(true));
        const keyboardDown = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardUp(false));

        return () => {
            _keyboardUp.remove();
            keyboardDown.remove();
        };
    }, []);

    const getTrackerIDWiseHandler = async () => {
        try {
            const { Data } = await Service.getTrackerIDWise(AccountID);
            console.log('file: createGeoFencing.js => line 61 => getTrackerIDWiseHandler => Data', Data);
            setTrackerID(Data[0]?.TrackerID);
            // if (Data[0]?.Data?.length === 1) {
            //     setTrackerID(Data[0].Data[0].TrackerID);
            // }
            // else {
            //     setTrackerIdWise(Data[0].Data);
            // }
        } catch (_err) {
            console.log('Inside Catch => ', _err);
        }
    };

    let timer;
    const onRegionChange = region => {
        clearTimeout(timer);
        timer = setTimeout(async () => {
            setCurrentRegion(region);
            // updateCurrentAddress(region.latitude, region.longitude);
        }, 500);
    };


    const Reset = () => {
        setEditing(null);
        setCreatingHole(false);
    };

    const finish = () => {
        setPolygons([editing]);
        // setEditing(null);
        setCreatingHole(false);
    };

    const onPress = (e) => {
        if (!editing) {
            console.log('if');
            setEditing({
                id: id++,
                coordinates: [e.nativeEvent.coordinate],
                holes: [],
            });
        } else if (!creatingHole) {
            console.log('else if');
            setEditing({
                ...editing,
                coordinates: [...editing.coordinates, e.nativeEvent.coordinate],
            });
        } else {
            console.log('else');
            const holes = [...editing.holes];
            holes[holes.length - 1] = [
                ...holes[holes.length - 1],
                e.nativeEvent.coordinate,
            ];
            setEditing({
                ...editing,
                id: id++, // keep incrementing id to trigger display refresh
                coordinates: [...editing.coordinates],
                holes,
            });
        }
    };

    const onSubmit = async () => {
        if (!fenceName) {
            setError('Required!');
            return;
        }
        Keyboard.dismiss();
        let obj;
        if (!isRectangle) {
            setIsLoading(true);
            obj = {
                AccountID,
                'TrackerIDs[0]': trackerID,
                FenceName: fenceName,
                FenceTypeID: 1,
                'geoFenceDetails[0].Latitude': currentRegion.latitude,
                'geoFenceDetails[0].Longitude': currentRegion.longitude,
                'geoFenceDetails[0].Radius': radius,
            };
            try {
                const { Status, Message } = await Service.createGeoFencing(obj);
                if (Status) {
                    showPopUpMessage('GeoFence Status', 'Geo Fence Saved Successfully!', 'success');
                    navigation.goBack();
                } else {
                    showPopUpMessage('GeoFence Status', Message, 'danger');
                }
            } catch (_error) {
                console.log('Inside Catch => ', _error);
            } finally {
                setIsLoading(false);
            }
        } else {
            if (!editing) {
                setError('Draw a polygon!');
                return;
            }
            setIsLoading(true);
            setPolygons([editing]);
            let updatedArray = [];
            for (const index in editing.coordinates) {
                const updatedObj = {};
                const element = editing.coordinates[index];
                updatedObj['geoFenceDetails[' + index + '].Latitude'] = element.latitude;
                updatedObj['geoFenceDetails[' + index + '].Longitude'] = element.longitude;
                updatedArray.push(updatedObj);
            }
            const object = {
                AccountID,
                'TrackerIDs[0]': trackerID,
                FenceName: fenceName,
                FenceTypeID: 2,
            };
            updatedArray.forEach((item) => {
                for (var attrib in item) {
                    object[attrib] = item[attrib];
                }
            });
            setEditing(null);
            setCreatingHole(false);

            try {
                const { Status, Message } = await Service.createGeoFencing(object);
                if (Status) {
                    showPopUpMessage('GeoFence Status', 'Geo Fence Saved Successfully!', 'success');
                    navigation.goBack();
                } else {
                    showPopUpMessage('GeoFence Status', Message, 'danger');
                }
            } catch (_error) {
                console.log('Inside Catch => ', _error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        // <View style={styles.root}>
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ ...styles.root }}>
            {
                !isRectangle ?
                    <View style={styles.circleSize}>
                        <TouchableOpacity activeOpacity={0.7} onPress={() => {
                            if (radius < 2000) {
                                setRadius(radius + 200);
                            }
                            else if (radius < 5000) {
                                setRadius(radius + 500);
                            } else if (radius < 10000) {
                                setRadius(radius + 1000);
                            } else {
                                setRadius(radius + 2000);
                            }
                        }}>
                            <Icon name="plussquare" type="antdesign" color={colors.secondary} size={30} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.7} onPress={() => {
                            if (radius > 300) {
                                if (radius < 2000) {
                                    setRadius(radius - 200);
                                } else if (radius < 5000) {
                                    setRadius(radius - 500);
                                } else if (radius < 10000) {
                                    setRadius(radius - 1000);
                                } else {
                                    setRadius(radius - 2000);
                                }
                            }
                            else {
                                setRadius(200);
                            }
                        }}>
                            <Icon name="minussquare" type="antdesign" color={colors.secondary} size={30} />
                        </TouchableOpacity>
                    </View> : null
            }

            {
                isRectangle ?
                    <MapView
                        // mapPadding={{
                        //     bottom: responsiveHeight(55),
                        //     left: responsiveWidth(10),
                        //     right: responsiveWidth(10),
                        //     top: responsiveHeight(10),
                        // }}
                        provider="google"
                        ref={mapRef}
                        style={styles.mapStyle}
                        initialRegion={currentRegion}
                        onRegionChangeComplete={onRegionChange}
                        mapType="standard"
                        // showsUserLocation={true}
                        followUserLocation={true}
                        onPress={onPress}
                    >
                        {polygons.map(polygon => {
                            return (
                                <Polygon
                                    key={polygon.id}
                                    coordinates={polygon.coordinates}
                                    holes={polygon.holes}
                                    strokeColor="#F00"
                                    fillColor={colors.primaryLight}
                                    strokeWidth={3}
                                    geodesic={true}
                                />
                            );
                        })}
                        {editing && (
                            <Polygon
                                key={editing.id}
                                coordinates={editing.coordinates}
                                holes={editing.holes}
                                strokeColor="rgba(52, 52, 52, 0.2)"
                                // strokeColor={colors.black}
                                fillColor={colors.primaryLight}
                                strokeWidth={3}
                                geodesic={true}
                            />
                        )}
                    </MapView>
                    :
                    <>
                        <MapView
                            // mapPadding={{
                            //     bottom: responsiveHeight(55),
                            //     left: responsiveWidth(10),
                            //     right: responsiveWidth(10),
                            //     top: responsiveHeight(10),
                            // }}
                            provider="google"
                            ref={mapRef}
                            style={[
                                styles.mapStyle,
                                // { flex: isKeyboardUp ? 0 : 1 }
                            ]}
                            initialRegion={currentRegion}
                            onRegionChangeComplete={onRegionChange}
                            mapType="standard"
                            showsUserLocation={true}
                            followUserLocation={true}
                        >
                            <MapView.Circle
                                // center={{ latitude: 43.6, longitude: 1.433333 }}
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
            {
                isRectangle ? <View style={styles.buttonContainer}>
                    {
                        editing ? <>
                            <TouchableOpacity
                                onPress={Reset}
                                style={[styles.bubble, styles.button]}
                            >
                                <Typography variant="semiBold" color={colors.white}>Reset</Typography>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={finish}
                                style={[styles.bubble, styles.button]}
                            >
                                <Typography variant="semiBold" color={colors.white}>Finish</Typography>
                            </TouchableOpacity>
                        </> : <Typography variant="semiBold">Tap on desired locations to create a region.</Typography>
                    }
                </View> : null
            }



            <View style={{ ...styles.bottomContainer, flex: isKeyboardUp ? 9 : TrackerCategoryArray[0].TrackerCategory === 'Teltonika' ? 2 : 1 }}>
                <Typography style={{}} variant="semiBold">GEOFENCE NAME</Typography>
                <TextInput
                    style={styles.input}
                    value={fenceName}
                    onChangeText={(text) => {
                        setFenceName(text);
                        setError('');
                    }}
                />
                {error ? <Typography variant="semiBold" color={colors.warning} >{error}</Typography> : null}
                <Typography style={{ marginVertical: 5 }} color={colors.textSecondary} variant="small">SELECTION TYPE</Typography>
                {TrackerCategoryArray[0].TrackerCategory === 'Teltonika' && <View style={[styles.row, { marginVertical: 2, marginBottom: responsiveHeight(2) }]}>
                    <TouchableOpacity
                        onPress={() => setIsRectangle(true)}
                        style={[styles.button,
                        { paddingVertical: 25, backgroundColor: isRectangle ? colors.primary : colors.backgroundWhite }]}
                        activeOpacity={0.7}
                    >
                        <Image source={images.rectangle} resizeMode="contain"
                            style={{ width: 100, height: 50, tintColor: !isRectangle ? '#ccc' : colors.white }} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setIsRectangle(false)}
                        style={[styles.button, {
                            backgroundColor: isRectangle ? colors.backgroundWhite : colors.primary,
                            paddingVertical: 25,
                        }]} activeOpacity={0.7}>
                        <Image source={images.circle} resizeMode="contain"
                            style={{ width: 100, height: 50 }} />
                    </TouchableOpacity>
                </View>}
                <View style={[styles.row, { marginBottom: 20 }]}>
                    <TouchableOpacity style={[styles.button, { backgroundColor: colors.white }]} activeOpacity={0.7} onPress={() => navigation.goBack()}  >
                        <Typography color={colors.black} variant="bold">Cancel</Typography>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={onSubmit}>
                        {
                            isLoading ? <ActivityIndicator color={colors.white} size="small" />
                                : <Typography color={colors.white} variant="bold">Done</Typography>
                        }
                    </TouchableOpacity>
                </View>
            </View>

        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    root: {
        flexGrow: 1,
        backgroundColor: colors.white,
    },
    mapStyle: {
        // ...StyleSheet.absoluteFill,
        width: '100%',
        borderRadius: 10,
        flex: 3,
    },
    bottomContainer: {
        flex: 2,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.25,
        // shadowRadius: 3.84,
        // elevation: 5,
        overflow: 'hidden',
        // flex: 1,
        // zIndex: 1,
        // position: 'absolute',
        // bottom: responsiveHeight(0),
        // right: responsiveWidth(0),
        // left: responsiveWidth(0),
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
        paddingVertical: isIOS() ? responsiveHeight(1.2) : responsiveHeight(0.2),
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
        // overflow: 'hidden',
        // zIndex: 2,
        // position: 'absolute',
        // top: responsiveHeight(0),
        // right: responsiveWidth(0),
        // left: responsiveWidth(0),
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

export default CreateGeoFencing;
