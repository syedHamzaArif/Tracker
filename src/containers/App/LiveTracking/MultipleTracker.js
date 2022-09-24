import images from '#assets/index';
import Typography from '#common/Typography';
import { Service } from '#config/service';
import { colors } from '#res/colors';
import { getFonts } from '#util/';
import { getRegionForCoordinates } from '#util/';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import { useFocusEffect } from '@react-navigation/core';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSelector } from 'react-redux';
import { Icon } from 'react-native-elements';
import Modal from '#common/Modal';
import ComplaintModalList from './ComplaintModalList';
import KeepAwake from 'react-native-keep-awake';
import signalr from 'react-native-signalr';
import { server } from '../../../../axios';

let count = 0;

const MultipleTracker = ({ navigation, route }) => {

    if (count === 0 || count === 100) {
        console.log('file: SingleCustomer.js => line 21 => time', new Date());
    }
    if (count <= 100) console.log('rerenders => ', count++);


    const { userData } = useSelector(state => state.userReducer);
    const [liveData, setLiveData] = useState([
        {
            latitude: 51.5063551,
            longitude: 64.4213255,
            latitudeDelta: 4.21,
            longitudeDelta: 4.21,
        },
    ]);
    const [selectedLiveData, setSelectedLiveData] = useState([]);
    const [data, setData] = useState([]);
    const [trackerIDWise, setTrackerIdWise] = useState('');
    const [selectedVehicles, setSelectedVehicles] = useState([]);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [signalRData, setSignalRData] = useState([]);
    const [ignitionOffCount, setIgnitionOffCount] = useState('');
    const [ignitionOnCount, setIgnitionOnCount] = useState('');
    const [totalCount, setTotalCount] = useState('');
    const mapRef = useRef(null);

    const { userData: { AccountID } } = useSelector(state => state.userReducer);
    const isPolice = AccountID === 3193 ? true : false;

    useFocusEffect(
        useCallback(() => {
            KeepAwake.activate();
            return KeepAwake.deactivate;
        }, [])
    );

    useEffect(() => {
        getLiveLocationDataFirstTime();
        getTrackerIDWiseHandler();
        // signalRConnectionHandler();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        getLiveLocation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signalRData, selectedLiveData]);

    useFocusEffect(
        useCallback(
            () => {
                let mounted = true;
                console.log('mount');

                const connection = signalr.hubConnection(server);

                connection.logging = true;

                const proxy = connection.createHubProxy('notificationHub');
                proxy.on('GetLiveTrackingData', async (model) => {
                    // console.log('file: MultipleTracker.js => line 72 => proxy.on => model', model);
                    setSignalRData(model.Data);
                    // await getLiveLocation(model.Data, selectedLiveData);
                });

                connection.start({ jsonp: true }).done(async () => {
                    proxy.invoke('helloServer', 'Hello Server, how are you?')
                        .done((directResponse) => {
                            console.log('direct-response-from-server', directResponse);
                        }).fail((_error) => {
                            console.log('file: SingleCustomer.js => line 104 => done => _error', _error);
                            console.log('Something went wrong when calling server, it might not be up and running?');
                        });
                }).fail(() => {
                    console.log('Failed');
                });

                //connection-handling
                connection.connectionSlow(() => {
                    console.log('We are currently experiencing difficulties with the connection.');
                });

                connection.disconnected(async () => {
                    if (!mounted) return;
                    setTimeout(function () {
                        connection.start({ jsonp: true })
                            .done(function () {
                                console.log('connected');

                            })
                            .fail(function (a) {
                                console.log('not connected' + a);
                            });
                    }, 5000); // Restart connection after 5 seconds.
                });

                connection.error((error) => {
                    const errorMessage = error.message;
                    let detailedError = '';
                    if (error.source && error.source._response) {
                        detailedError = error.source._response;
                    }
                    if (detailedError === 'An SSL error has occurred and a secure connection to the server cannot be made.') {
                        console.log('When using react-native-signalr on ios with http remember to enable http in App Transport Security https://github.com/olofd/react-native-signalr/issues/14');
                    }
                    console.debug('SignalR error: ' + errorMessage, detailedError);
                });

                return () => {
                    mounted = false;
                    connection.stop();
                };
            },
            [],
        )
    );

    const getLiveLocationDataFirstTime = async () => {
        try {
            const { Data } = await Service.liveTracking({ AccountID });
            if (Data) {
                getLocationHandler(Data[0]?.Data, false);
                setData(Data[0]);
            }
        } catch (error) {
            console.log('Inside Catch => ', error);
        }
    };

    const getTrackerIDWiseHandler = async () => {
        try {
            const { Data } = await Service.getTrackerIDWise(userData.AccountID);
            setTrackerIdWise(Data);
        } catch (error) {
            console.log('Inside Catch => ', error);
        }
    };

    const vehicleSelectHandler = async (_selectedData) => {
        console.log('file: MultipleTracker.js => line 155 => vehicleSelectHandler => _selectedData', _selectedData);
        console.log('file: MultipleTracker.js => line 157 => vehicleSelectHandler => selectedLiveData', selectedLiveData);

        if (selectedLiveData.length && !_selectedData.length) { setSelectedLiveData([]); }
        if (_selectedData?.length === 1) {
            navigation.navigate('My Tracker', {
                headerName: _selectedData?.[0]?.RegNumber,
                TrackerID: _selectedData?.[0]?.TrackerID,
                currentRegion: {
                    latitude: _selectedData?.[0]?.Latitude,
                    longitude: _selectedData?.[0]?.Longitude,
                },
            });
        } else {
            setSelectedLiveData(_selectedData);
        }
        setCategoryModalVisible(false);
    };

    const getLiveLocation = async () => {
        try {
            if (!signalRData.length) return;

            const Data = signalRData[0].Data.filter(item => item.AccID === AccountID);
            const ignitionOFFCount = Data.filter(item => item.IgnitionStatus === 'OFF');
            setIgnitionOffCount(ignitionOFFCount.length);
            const ignitionONCount = Data.filter(item => item.IgnitionStatus === 'ON');
            setIgnitionOnCount(ignitionONCount.length);
            const total = parseInt(ignitionONCount.length, 10) + parseInt(ignitionOFFCount.length, 10);
            setTotalCount(total);
            if (Data) await getLocationHandler(Data, selectedLiveData);
        } catch (error) {
            console.log('Inside Catch => ', error);
        }
    };

    const getLocationHandler = async (_data, selectedData) => {
        try {
            let updatedLocation = [];
            for (const key in _data) {
                const { Lat: latitude, Long: longitude, AGRN, Maker, Speed, IgnitionStatus, RegNumber } = _data[key];
                let obj = { latitude, longitude, AGRN, Maker, IgnitionStatus, Speed, RegNumber };
                updatedLocation.push(obj);
            }

            var filtered = [];
            if (selectedData.length) {
                filtered = updatedLocation
                    .filter(_item => selectedData.some(sel => sel.RegNumber === _item.RegNumber)
                    );
                setLiveData(filtered);
            } else {
                setLiveData(updatedLocation);
            }
            const result = getRegionForCoordinates(selectedData ? filtered : updatedLocation);
            mapRef.current.animateToRegion(result, 1000);
        } catch (error) {
            // console.log('Inside Catch => ', error);
        }
    };

    return (
        <View style={styles.root}>
            <MapView
                provider="google"
                mapPadding={{ bottom: responsiveHeight(55), left: responsiveWidth(10), right: responsiveWidth(10), top: responsiveHeight(10) }}
                ref={mapRef}
                style={styles.mapStyle}
                initialRegion={liveData[0]}
                mapType="standard"
            >
                {
                    liveData?.map((item, index) => {
                        const isActive = item.IgnitionStatus === 'ON';
                        if (item.latitude && item.longitude)
                            return (
                                <Marker key={`marker${index}`}
                                    coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                                    title={`Vehicle #: ${item?.RegNumber}`}
                                    description={`${item?.Speed} KM/H`}
                                    pinColor={isActive ? colors.primary : colors.warning}
                                >
                                    {!isPolice && <Image
                                        // source={
                                        //     isPolice ?
                                        //         isActive ?
                                        //             images.policeActive
                                        //             : images.policeInactive
                                        //         : images.routeStart
                                        // }
                                        source={images.routeStart}
                                        style={{
                                            width: 40, height: 40,
                                            // transform: [{
                                            //     rotate: liveData ? `${liveData?.Direction}deg` : '0deg',
                                            // }],
                                        }}
                                        resizeMode="contain"
                                    />}
                                </Marker>
                            );
                    })
                }
            </MapView>
            <View style={styles.bottomContainer}>
                <TouchableOpacity style={[styles.container, {
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }]}
                    activeOpacity={0.7} onPress={() => setCategoryModalVisible(true)}
                >
                    <View>
                        <Typography variant="small">Select Vehicles</Typography>
                        {/* <Typography variant="bold" >{vehicleSelect ? vehicleSelect.RegNumber : 'All'}</Typography> */}
                        <Typography variant="bold" >All</Typography>
                    </View>
                    <Icon
                        underlayColor="transparent"
                        name={'down'}
                        type="antdesign"
                        color={colors.textSecondary}
                        iconStyle={{ marginRight: 10 }}
                    />
                </TouchableOpacity>

                <View style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    // backgroundColor: 'red',
                }}>
                    <View style={[styles.container, { width: '45%', height: responsiveHeight(14), paddingHorizontal: responsiveHeight(2) }]}>
                        <Image source={images.vehicle}
                            style={{
                                width: 40, height: 40, alignSelf: 'flex-end',
                            }}
                            resizeMode="contain"
                        />
                        <Typography variant="small" size={14} color={colors.textSecondary}>Vehicles</Typography>
                        <Typography variant="black">{totalCount ? totalCount : data?.TotalIgnitionOnCount + data?.TotalIgnitionOffCount}</Typography>
                    </View>
                    <View style={[styles.container, { width: '45%', height: responsiveHeight(14), paddingHorizontal: responsiveHeight(2) }]}>
                        <Image source={images.ignitionOn}
                            style={{
                                width: 25, height: 25, alignSelf: 'flex-end', marginTop: 5,
                            }}
                            resizeMode="contain"
                        />
                        <Typography style={{ marginTop: 10 }} variant="small" size={14} color={colors.textSecondary}>Ignition ON</Typography>
                        <Typography variant="black">{ignitionOnCount ? ignitionOnCount : data?.TotalIgnitionOnCount}</Typography>
                    </View>
                </View>

                <View style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}>

                    <View style={[styles.container, { width: '45%', height: responsiveHeight(14), paddingHorizontal: responsiveHeight(2) }]}>
                        <Image source={images.ignitionOff}
                            style={{
                                width: 25, height: 25, alignSelf: 'flex-end', marginTop: 5,
                            }}
                            resizeMode="contain"
                        />
                        <Typography style={{ marginTop: 10 }} variant="small" size={14} color={colors.textSecondary}>Ignition OFF</Typography>
                        <Typography variant="black">{ignitionOffCount ? ignitionOffCount : data?.TotalIgnitionOffCount}</Typography>
                    </View>
                    <View style={[styles.container, { width: '45%', height: responsiveHeight(14), paddingHorizontal: responsiveHeight(2) }]}>
                        <Image source={images.idle}
                            style={{
                                width: 40, height: 40, alignSelf: 'flex-end',
                            }}
                            resizeMode="contain"
                        />
                        <Typography variant="small" size={14} color={colors.textSecondary}>Idle</Typography>
                        <Typography variant="black">-</Typography>
                    </View>
                </View>

            </View>
            <Modal
                setVisible={setCategoryModalVisible}
                visible={categoryModalVisible}
                style={styles.modal}
            >
                <ComplaintModalList
                    data={trackerIDWise}
                    selected={selectedVehicles}
                    setSelected={setSelectedVehicles}
                    pressHandler={vehicleSelectHandler}
                    heading={'All'}
                />
            </Modal>
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
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
        zIndex: 2,
        position: 'absolute',
        bottom: responsiveHeight(0),
        width: '100%',
        padding: responsiveHeight(1),
        paddingHorizontal: responsiveHeight(2),
    },
    modal: {
        justifyContent: 'center',
        overflow: 'hidden',
        width: '90%',
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
        // justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: responsiveHeight(1.5),
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
    container: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        backgroundColor: 'white',
        elevation: 5,
        marginVertical: responsiveHeight(2),
        borderRadius: 8,
        padding: responsiveHeight(1),
    },
    loading: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        opacity: 0.7,
        zIndex: 1,
        ...StyleSheet.absoluteFill,
    },
});

export default MultipleTracker;
