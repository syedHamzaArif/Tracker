import React, { useState, useContext, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Button from '#common/Button';
import EmptyComponent from '#common/EmptyComponent';
import LoaderView from '#common/LoaderView';
import Modal from '#common/Modal';
import Typography from '#common/Typography';
import { colors } from '#res/colors';
import { getDate } from '#util/';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import { useSelector } from 'react-redux';
import ModalDatePicker from 'react-native-modal-datetime-picker';
import { Service } from '#config/service';
import { AuthContext } from '#context/';
import { useFocusEffect } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import { hitSlop } from '#util/';
import DeleteView from '#common/DeleteView';
import { showPopUpMessage } from '#util/';

const GeoFencing = ({ navigation }) => {

    const { userData: { AccountID, UserTypeID } } = useSelector(state => state.userReducer);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState('');
    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);
    const [dateModalVisible, setDateModalVisible] = useState(false);
    const [filterBackground, setFilterBackground] = useState('1');
    const [dateView, setDateView] = useState(false);
    const [trackerId, setTrackerID] = useState('');
    const [trackerIDWise, setTrackerIdWise] = useState('');
    const { showAuthFailModal } = useContext(AuthContext);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [geoFenceID, setGeoFenceID] = useState('');

    const [dateFrom, setDateFrom] = useState(new Date());
    const [showFrom, setShowFrom] = useState(false);


    useFocusEffect(
        useCallback(() => {
            getGeoFencingList(new Date(), new Date());
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])
    );

    const getTrackerIDWiseHandler = async () => {
        setIsLoading(true);
        try {
            const { Data } = await Service.getTrackerIDWise(AccountID);
            if (Data[0]?.Data?.length === 1) {
                setTrackerID(Data[0].Data[0].TrackerID);
            }
            else {
                setTrackerIdWise(Data[0].Data);
            }
            if (UserTypeID === '1') {
                await getGeoFencingList(new Date(), new Date(), (Data[0].Data[0].TrackerID));
            }
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getGeoFencingList = async (_from, _to, _trackerId, isFiltered, updatedPage) => {

        const obj = {
            AccountID: AccountID,
            // fromDate: _from,
            // toDate: _to,
        };
        setIsLoading(true);
        try {
            const { Data } = await Service.getGeoFencingList(obj);
            if (Data) {
                setData(Data);
            } else {
                setData([]);
            }
        } catch (error) {
            if (error === 'Authorization has been denied for this request.') {
                showAuthFailModal();
            }
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshHandler = async () => {
        try {
            setRefreshing(true);
            await getGeoFencingList(dateFrom, date);
            setRefreshing(false);
        } catch (error) {
            console.log('Inside Catch => ', error);
        }
    };

    const deleteModalPressHandler = async (_item) => {
        setIsLoading(true);
        setDeleteModalVisible(false);
        try {
            const { Message } = await Service.deleteGeoFencing({ GeoFenceID: geoFenceID });
            if (Message === 'OK') {
                await getGeoFencingList(dateFrom, date);
            } else {
                showPopUpMessage('GeoFence Delete Status', Message, 'danger');
            }
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderData = ({ item }) => {
        return (
            <TouchableOpacity style={styles.itemContainer} activeOpacity={1}
                onPress={() => navigation.navigate('Show Geo Fence', { passingData: item })}
            >
                <View style={[styles.rowItem, { justifyContent: 'space-between' }]}>
                    <Typography variant="semiBold">GEOFENCE NAME</Typography>
                    <Icon name="trash-alt" type="font-awesome-5" size={18}
                        underlayColor="transparent"
                        hitSlop={hitSlop}
                        containerStyle={{ padding: 8 }}
                        color={colors.primary}
                        onPress={() => {
                            setGeoFenceID(item.ID);
                            setDeleteModalVisible(true);
                        }}
                    />
                </View>
                <Typography style={{ marginBottom: responsiveHeight(1) }} color={colors.textSecondary} size={14} variant="small">{item?.FenceName}</Typography>
                <Typography variant="semiBold">VEHICLE</Typography>
                <Typography style={{ marginBottom: responsiveHeight(1) }} color={colors.textSecondary} size={14} variant="small">{item?.Maker} {item.Model} {item?.Year}</Typography>
                <Typography variant="semiBold">SELECTION TYPE</Typography>
                <Typography style={{ marginBottom: responsiveHeight(1) }} color={colors.textSecondary} size={14} variant="small">{item?.FenceType}</Typography>
            </TouchableOpacity>
        );
    };


    //To
    const onChange = (selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(false);
        setDate(currentDate);
        setFilterBackground('0');
    };
    const showMode = (currentMode) => {
        setShow(true);
    };

    const showDatepicker = () => {
        showMode('date');
    };


    // From
    const onChangeFrom = (selectedDate) => {
        const currentDate = selectedDate || date;
        setShowFrom(false);
        setDateFrom(currentDate);
    };
    const showModeFrom = (currentMode) => {
        setShowFrom(true);
    };

    const showDatepickerFrom = () => {
        showModeFrom('date');
    };

    const datePressHandler = (_type) => {
        setDateView(false);
        if (_type === 'today') {
            setFilterBackground('1');
            setDate(new Date());
            setDateFrom(new Date());
            getGeoFencingList(new Date(), new Date(), null, true, 1);
        }
        else if (_type === 'yesterday') {
            setFilterBackground('2');
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yest = yesterday.toDateString();
            setDate(yest);
            setDateFrom(yest);
            getGeoFencingList(yest, yest, null, true, 1);
        }
        else if (_type === 'week') {
            setFilterBackground('3');
            const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const today = new Date();
            setDateFrom(week);
            setDate(today);
            getGeoFencingList(week, today, null, true, 1);
        } else {
            setFilterBackground('0');
        }
    };

    const calenderHandler = () => {
        setDateModalVisible(true);
    };

    const saveHandler = () => {
        setDateModalVisible(false);
        setDateView(true);
        setFilterBackground('0');
        getGeoFencingList(dateFrom, date, null, true, 1);
    };

    return (
        <View style={styles.root}>
            {
                isLoading ? <LoaderView /> :
                    <>
                        {/* <View style={[styles.rowItem, { justifyContent: 'space-around', paddingVertical: responsiveHeight(1.2) }]}>
                            <View style={styles.rowItem}>
                                <TouchableOpacity
                                    style={[styles.boxes, {
                                        borderTopLeftRadius: 12,
                                        borderBottomLeftRadius: 12,
                                        backgroundColor: filterBackground === '1' ? colors.primary : colors.white,
                                    }]}
                                    onPress={datePressHandler.bind(this, 'today')}
                                >
                                    <Typography
                                        color={filterBackground === '1' ? colors.white : colors.textSecondary}
                                    >Today</Typography>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.boxes, {
                                    backgroundColor: filterBackground === '2' ? colors.primary : colors.white,
                                }]}
                                    onPress={datePressHandler.bind(this, 'yesterday')}
                                >
                                    <Typography
                                        color={filterBackground === '2' ? colors.white : colors.textSecondary}
                                    >Yesterday</Typography>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.boxes, {
                                    borderTopRightRadius: 12,
                                    borderBottomRightRadius: 12,
                                    backgroundColor: filterBackground === '3' ? colors.primary : colors.white,
                                }]}
                                    onPress={datePressHandler.bind(this, 'week')}
                                >
                                    <Typography
                                        color={filterBackground === '3' ? colors.white : colors.textSecondary}
                                    >Last Week</Typography>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={[styles.boxes, {
                                borderRadius: 10,
                            }]}
                                onPress={calenderHandler}
                            >
                                <Image source={images.calendarIcon} resizeMode="contain"
                                    style={{ width: 20, height: 20 }} />
                            </TouchableOpacity>
                        </View> */}
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            data={data}
                            renderItem={renderData}
                            keyExtractor={(item, index) => index.toString()}
                            ListEmptyComponent={<EmptyComponent title="No Geofence Created" />}
                            contentContainerStyle={{ flexGrow: 1 }}
                            onRefresh={refreshHandler}
                            refreshing={refreshing}
                        />
                        <Button style={{ marginVertical: 25 }}
                            onPress={() => navigation.navigate('Create Geo Fence')} title="CREATE NEW GEO FENCE" />
                    </>

            }
            <Modal
                setVisible={setDateModalVisible}
                visible={dateModalVisible}
            >
                <View style={styles.bottomContainer}>
                    {/* *******Start time******* */}

                    <Typography style={{ marginHorizontal: responsiveWidth(4) }}
                        color={colors.textSecondary} size={14} variant="medium">START DATE/TIME</Typography>
                    <TouchableOpacity style={[styles.selectView]}
                        onPress={showDatepickerFrom}
                    >
                        <Typography variant="bold">{getDate(dateFrom)}</Typography>
                    </TouchableOpacity>

                    {/* *******End time******* */}

                    <Typography style={{ marginHorizontal: responsiveWidth(4) }} color={colors.textSecondary}
                        size={14} variant="medium">END DATE/TIME</Typography>
                    <TouchableOpacity style={[styles.selectView]}
                        onPress={showDatepicker}
                    >
                        <Typography variant="bold">{getDate(date)}</Typography>
                    </TouchableOpacity>
                    <Button style={{ margin: 10 }} onPress={saveHandler} variant="black" title="Apply" />

                </View>
                <ModalDatePicker
                    isVisible={show}
                    value={date}
                    disabled={!dateFrom}
                    mode="date"
                    is24Hour={true}
                    minimumDate={dateFrom ?? null}
                    maximumDate={new Date()}
                    display="spinner"
                    onConfirm={onChange}
                    onCancel={setShow.bind(this, false)}
                />
                <ModalDatePicker
                    isVisible={showFrom}
                    value={dateFrom}
                    mode="date"
                    is24Hour={true}
                    maximumDate={new Date()}
                    display="spinner"
                    onConfirm={onChangeFrom}
                    onCancel={setShowFrom.bind(this, false)}
                />
            </Modal>
            <Modal style={{ justifyContent: 'center', alignItems: 'center' }}
                visible={deleteModalVisible} setVisible={setDeleteModalVisible}>
                <DeleteView pressHandler={deleteModalPressHandler} cancelHandler={() => setDeleteModalVisible(false)} />
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        paddingHorizontal: 10,
        backgroundColor: colors.background,
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
    boxes: {
        borderWidth: 1,
        borderColor: colors.gray,
        paddingVertical: 17,
        backgroundColor: colors.white,
        width: responsiveWidth(23),
        alignItems: 'center',
    },
    bottomContainer: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor: colors.white,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 5,
        borderColor: colors.white,
        paddingVertical: 10,
    },
    selectView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: responsiveWidth(4),
        marginVertical: responsiveHeight(2),
        borderWidth: 1,
        borderColor: colors.backgroundWhite,
        padding: responsiveWidth(2),

    },
});

export default GeoFencing;
