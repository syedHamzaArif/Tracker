import images from '#assets/';
import Typography from '#common/Typography';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, Image, Animated, TouchableOpacity } from 'react-native';
import { colors } from '#res/colors';
import { Service } from '#config/service';
import { useSelector } from 'react-redux';
import EmptyComponent from '#common/EmptyComponent';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import { AuthContext } from '#context/';
import Modal from '#common/Modal';
import Button from '#common/Button';
import { getDate, height } from '#util/index';
import ComplaintModalList from '#common/ComplaintModalList';
import LoaderView from '#common/LoaderView';
import moment from 'moment';
import ModalDatePicker from 'react-native-modal-datetime-picker';
import ImageLoader from '#common/ImageLoader';
import { Icon } from 'react-native-elements';

const TripsReport = ({ navigation }) => {

    const { userData: { AccountID } } = useSelector(state => state.userReducer);
    const listRef = useRef();
    const _scrollY = useRef(new Animated.Value(0)).current;

    const [saveData, setSaveData] = useState('');
    const [distance, setDistance] = useState(0);
    const [countTrips, setCountTrips] = useState(0);
    const [trackerIDWise, setTrackerIdWise] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [filterBackground, setFilterBackground] = useState('1');
    const [trackerId, setTrackerID] = useState('');
    const [typeSelectedData, setTypeSelectedData] = useState('');
    // modals
    const [typeModalVisible, setTypeModalVisible] = useState(false);
    const [dateModalVisible, setDateModalVisible] = useState(false);
    const [dateView, setDateView] = useState(false);

    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);

    const [dateFrom, setDateFrom] = useState(new Date());
    const [modeFrom, setModeFrom] = useState('date');
    const [showFrom, setShowFrom] = useState(false);

    // pagination
    const [refreshing, setRefreshing] = useState(false);
    const [onEndReachedCalledDuringMomentum, setOnEndReachedCalledDuringMomentum] = useState(true);
    const [endLoader, setEndLoader] = useState(false);
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(null);


    const { showAuthFailModal } = useContext(AuthContext);

    useEffect(() => {
        getTrackerIDWiseHandler();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getTrackerIDWiseHandler = async () => {
        setIsLoading(true);
        try {
            const { Data } = await Service.getTrackerIDWise(AccountID);
            if (Data?.length === 1) {
                setTrackerID(Data[0]?.TrackerID);
                await getTripsHandler(new Date(), new Date(), (Data[0]?.TrackerID));
            }
            else {
                setTrackerIdWise(Data[0].Data);
            }
        } catch (error) {
            console.log('file: TripsReport.js => line 75 => getTrackerIDWiseHandler => error', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getTripsHandler = async (_from, _to, _trackerId, isFiltered, updatedPage) => {
        console.log('file: index.js => line 83 => getTripsHandler => isFiltered', isFiltered);

        const obj = {
            pageNumber: updatedPage ? updatedPage : page,
            pageSize: 10,
            IsPagination: true,
            AccountID: AccountID,
            TrackerID: _trackerId ? _trackerId : trackerId,
            fromDate: _from,
            toDate: _to,
        };
        isFiltered && setIsLoading(true);
        try {
            const { Data } = await Service.getAllTrips(obj);
            if (Data) {
                if (isFiltered) {
                    setSaveData(Data[0].ItemArray);
                    setTotalItems(Data[0].TotalItem);
                    setCountTrips(Data[0].TotalItem);
                    setDistance(Data[0].TotalDistance);
                }
                else {
                    setSaveData(prev => [...prev, ...Data[0].ItemArray]);
                    setTotalItems(Data[0].TotalItem);
                    setCountTrips(Data[0].TotalItem);
                    setDistance(Data[0].TotalDistance);
                }
            } else {
                setSaveData([]);
                setTotalItems('');
                setCountTrips(0);
                setDistance(0);
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

    const renderData = ({ item }) => {
        return (
            <View style={[styles.itemContainer, { flexDirection: 'row', alignItems: 'center' }]}>
                <Image source={images.notifyIcon} resizeMode="contain"
                    style={{ width: 30, height: 55 }} />
                <View style={{ paddingHorizontal: 10 }}>
                    <Typography color={colors.textSecondary} size={12} variant="semiBold">START DATE</Typography>
                    <Typography>
                        <Typography size={16} variant="bold">
                            {item?.Data?.IgnitionOnDateTime ? moment(item?.Data.IgnitionOnDateTime).format('DD-MM-YYYY')?.split('T')[0] : '-'}
                        </Typography>
                        <Typography color={colors.textSecondary} size={14} variant="semiBold">
                            {`   ${item?.Data?.IgnitionOnDateTime?.split('T')[1]}`}
                        </Typography>
                    </Typography>
                    <Typography color={colors.textSecondary} size={12} style={{ marginTop: 6 }} variant="semiBold">END DATE</Typography>
                    <Typography>
                        <Typography size={16} variant="bold">
                            {item?.Data?.IgnitionOffDateTime ? moment(item?.Data.IgnitionOffDateTime).format('DD-MM-YYYY')?.split('T')[0] : '-'}
                        </Typography>
                        <Typography color={colors.textSecondary} size={14} variant="semiBold">
                            {`   ${item?.Data?.IgnitionOffDateTime?.split('T')[1]}`}
                        </Typography>
                    </Typography>
                </View>
            </View>
        );
    };

    const datePressHandler = (_type) => {
        setDateView(false);
        if (_type === 'today') {
            setFilterBackground('1');
            setDate(new Date());
            setPage(1);
            getTripsHandler(new Date(), new Date(), null, true, 1);
        }
        else if (_type === 'yesterday') {
            setFilterBackground('2');
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yest = yesterday.toDateString();
            setDate(yest);
            setDateFrom(yest);
            setPage(1);
            getTripsHandler(yest, yest, null, true, 1);
        }
        else if (_type === 'week') {
            setFilterBackground('3');
            const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const today = new Date();
            setDateFrom(week);
            setDate(today);
            setPage(1);
            getTripsHandler(week, today, null, true, 1);
        } else {
            setFilterBackground('0');
        }
    };

    const newsPressHandler = (_value) => {
        setTrackerID(_value.TrackerID);
        setTypeSelectedData(_value);
        setTypeModalVisible(false);
        getTripsHandler(dateFrom, date, _value.TrackerID);
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
        setMode(currentMode);
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
        setModeFrom(currentMode);
    };

    const showDatepickerFrom = () => {
        showModeFrom('date');
    };

    const saveHandler = () => {
        setDateModalVisible(false);
        setDateView(true);
        setFilterBackground('0');
        setPage(1);
        getTripsHandler(dateFrom, date, null, true, 1);
    };

    const calenderHandler = () => {
        setDateModalVisible(true);
    };


    const onEndReachHandler = async () => {
        if (totalItems > saveData?.length) {
            console.log('if');
            try {
                if (!onEndReachedCalledDuringMomentum) {
                    console.log('if if');
                    setOnEndReachedCalledDuringMomentum(true);
                    setEndLoader(true);
                    const updatedPage = page + 1;
                    console.log('file: index.js => line 256 => onEndReachHandler => updatedPage', updatedPage);
                    setPage(updatedPage);
                    await getTripsHandler(dateFrom, date, trackerId, null, updatedPage);
                    setEndLoader(false);
                }
            } catch (error) {
                console.log('Inside Catch => ', error);
            } finally {
            }
        }
    };

    const onMomentumScrollBeginHandler = () => {
        setOnEndReachedCalledDuringMomentum(false);
    };

    const scrollToTop = () => {
        listRef.current.scrollToOffset({ offset: 0, animated: true });
    };

    const Footer = (
        endLoader ?
            <View style={{ height: 100, width: '100%' }}>
                <ImageLoader />
            </View> :
            saveData?.length >= totalItems && saveData?.length > 5 ?
                <TouchableOpacity activeOpacity={0.6}
                    onPress={scrollToTop}
                    style={{ height: height * 0.1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <Icon name="arrow-up" type="font-awesome" size={20} />
                </TouchableOpacity>
                : null
    );

    const refreshHandler = async () => {
        try {
            setRefreshing(true);
            await getTripsHandler(dateFrom, date, trackerId, true);
            setRefreshing(false);
        } catch (error) {
            console.log('Inside Catch => ', error);
        }
    };

    return (
        <View style={styles.root}>
            {
                isLoading ?
                    <LoaderView /> :
                    <>
                        <View style={[styles.rowItem, { justifyContent: 'space-around' }]}>
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
                                // onPress={showDatepicker}
                                onPress={calenderHandler}
                            >
                                <Image source={images.calendarIcon} resizeMode="contain"
                                    style={{ width: 20, height: 20 }} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.container}>
                            <View style={{ alignItems: 'center' }}>
                                <Typography size={16} variant="bold">Total Distance</Typography>
                                <View style={styles.box}>
                                    <Typography color={colors.white} variant="regular">{parseFloat(distance)?.toFixed(2)} Km</Typography>
                                </View>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <Typography size={16} variant="bold">No. Of Trips</Typography>
                                <View style={styles.box}>
                                    <Typography color={colors.white} variant="regular">{countTrips}</Typography>
                                </View>
                            </View>
                        </View>
                        {
                            trackerIDWise?.length > 1 ?
                                <>
                                    <Typography size={12}
                                        style={{ marginVertical: 5 }}
                                        variant="small">Reg #</Typography>
                                    <TouchableOpacity style={[styles.input, { paddingVertical: 10 }]}
                                        onPress={() => setTypeModalVisible(true)}
                                    >
                                        <Typography variant="medium">{typeSelectedData.RegNumber ? typeSelectedData.RegNumber : 'Select Vehicle'}</Typography>
                                        <Modal
                                            setVisible={setTypeModalVisible}
                                            visible={typeModalVisible}
                                            style={{ marginVertical: responsiveHeight(15) }}
                                        >
                                            <ComplaintModalList
                                                data={trackerIDWise}
                                                pressHandler={newsPressHandler}
                                                heading={'Reg #'}
                                            />
                                        </Modal>
                                    </TouchableOpacity>
                                </>
                                : null
                        }
                        {
                            dateView ?
                                <View style={[styles.itemContainer, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                                    <Typography color={colors.textSecondary} size={14} variant="medium">From : </Typography>
                                    <Typography variant="bold">{getDate(dateFrom)}</Typography>

                                    <Typography color={colors.textSecondary} size={14} variant="medium">To : </Typography>
                                    <Typography variant="bold">{getDate(date)}</Typography>

                                </View> : null
                        }
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            data={saveData}
                            renderItem={renderData}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={{ flexGrow: 1 }}
                            ListEmptyComponent={<EmptyComponent title="No Trips Found" />}
                            scrollEventThrottle={1}
                            onRefresh={refreshHandler}
                            onEndReachedThreshold={0.8}
                            onEndReached={onEndReachHandler}
                            onMomentumScrollBegin={onMomentumScrollBeginHandler}
                            refreshing={refreshing}
                            ref={listRef}
                            ListFooterComponent={Footer}
                            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: _scrollY } } }], { useNativeDriver: false })}
                        />
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
                    </>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        paddingHorizontal: 10,
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
        marginVertical: 5,
    },
    boxes: {
        borderWidth: 1,
        borderColor: colors.gray,
        paddingVertical: 17,
        backgroundColor: colors.white,
        width: responsiveWidth(23),
        alignItems: 'center',
    },
    input: {
        backgroundColor: colors.white,
        borderColor: colors.black,
        borderWidth: 0.1,
        borderRadius: 1,
        padding: 4,
        color: colors.black,
        marginBottom: 10,
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
        // borderTopLeftRadius: 12,
        // borderTopRightRadius: 12,
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
    box: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
        padding: 5,
        width: responsiveHeight(12),
        // paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
        borderRadius: 8,
        backgroundColor: colors.primary,
        marginTop: responsiveHeight(3),
    },
    container: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        backgroundColor: colors.white,
        elevation: 5,
        margin: responsiveHeight(1),
        width: '95%',
        alignItems: 'center',
        borderRadius: 7,
        paddingHorizontal: 4,
        paddingVertical: responsiveHeight(2),
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: responsiveHeight(2),
    },
});

export default TripsReport;

