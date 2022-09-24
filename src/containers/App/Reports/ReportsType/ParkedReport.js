import images from '#assets/';
import EmptyComponent from '#common/EmptyComponent';
import LoaderView from '#common/LoaderView';
import Typography from '#common/Typography';
import { Service } from '#config/service';
import { AuthContext } from '#context/';
import { colors } from '#res/colors';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { View, StyleSheet, TouchableOpacity, Image, FlatList, Animated } from 'react-native';
import { useSelector } from 'react-redux';
import ModalDatePicker from 'react-native-modal-datetime-picker';
import Button from '#common/Button';
import Modal from '#common/Modal';
import { getDate } from '#util/';
import moment from 'moment';
import { timeConvert } from '#util/';
import ComplaintModalList from '#common/ComplaintModalList';
import ImageLoader from '#common/ImageLoader';
import { height } from '#util/';
import { Icon } from 'react-native-elements';

const ParkedReport = ({ navigation }) => {

    const { userData } = useSelector(state => state.userReducer);
    const listRef = useRef();
    const _scrollY = useRef(new Animated.Value(0)).current;

    const [saveData, setSaveData] = useState([]);
    const [trackerIDWise, setTrackerIdWise] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [filterBackground, setFilterBackground] = useState('1');
    const [trackerId, setTrackerID] = useState('');
    const [totalStops, setTotalSteps] = useState(0);
    const [totalMin, setTotalMin] = useState(0);
    const [typeSelectedData, setTypeSelectedData] = useState('');
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
    const { showAuthFailModal } = useContext(AuthContext);

    useEffect(() => {
        getTrackerIDWiseHandler();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    const getTrackerIDWiseHandler = async () => {
        setIsLoading(true);
        try {
            const { Data } = await Service.getTrackerIDWise(userData.AccountID);
            if (Data?.length === 1) {
                setTrackerID(Data[0]?.TrackerID);
                await getTripsHandler(new Date(), new Date(), (Data[0]?.TrackerID));
            }
            else {
                setTrackerIdWise(Data);
            }
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveHandler = () => {
        setDateModalVisible(false);
        setDateView(true);
        setFilterBackground('0');
        setPage(1);
        getTripsHandler(dateFrom, date, null, true, 1);
    };

    const getTripsHandler = async (_from, _to, _trackerId, isFiltered, updatedPage) => {

        const obj = {
            pageNumber: updatedPage ? updatedPage : page,
            pageSize: 10,
            IsPagination: true,
            AccountID: userData.AccountID,
            TrackerID: _trackerId ? _trackerId : trackerId,
            fromDate: _from,
            toDate: _to,
            IsParkedTrip: true,
        };
        isFiltered && setIsLoading(true);
        try {
            const { Data } = await Service.getParkedReport(obj);
            if (Data) {
                if (isFiltered) {
                    setTotalSteps(Data[0].TotalItem);
                    setTotalMin(Data[0].PrkdMins);
                    setSaveData(Data[0].ItemArray);
                } else {
                    setTotalSteps(Data[0].TotalItem);
                    setTotalMin(Data[0].PrkdMins);
                    setSaveData(prev => [...prev, ...Data[0].ItemArray]);
                }
            } else {
                console.log('else');
                setSaveData([]);
                setTotalSteps(0);
                setTotalMin(0);
            }
        } catch (error) {
            if (error === 'Authorization has been denied for this request.') {
                showAuthFailModal();
            }
            console.log('Inside Catch TripsHandler=> ', error);
        } finally {
            setIsLoading(false);
        }
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

    const datePressHandler = (_type) => {
        setDateView(false);
        if (_type === 'today') {
            setFilterBackground('1');
            setDate(new Date());
            setDateFrom(new Date());
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

    const calenderHandler = () => {
        setDateModalVisible(true);
    };

    const setDateHandler = (date) => {
        const updateHour = date.split(':')[0];
        const updateMinute = date.split(':')[1];
        let updatedDate;
        if (updateHour === '0') {
            updatedDate = `${updateMinute} min`;
            // setDuration(updatedDate);
            return updatedDate;
        }
        else {
            updatedDate = `${updateHour} hr ${updateMinute} min`;
            // setDuration(updatedDate);
            return updatedDate;

        }
    };
    const onEndReachHandler = async () => {
        if (totalStops > saveData.length) {
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
            saveData.length >= totalStops && saveData.length > 5 ?
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



    const renderData = ({ item }) => {
        return (
            <View style={styles.itemContainer} activeOpacity={0.7}>
                <Typography>
                    <Typography color={colors.textBody} variant="regular">{moment(item?.Data?.ServerTime?.split('T')[0]).format('DD-MM-YYYY')}</Typography>
                    <Typography color={colors.textSecondary} variant="small">   {item?.Data?.ServerTime?.split('T')[1]}</Typography>
                </Typography>
                {/* <View style={styles.row}>
                    <Image source={images.Oval} resizeMode="contain"
                        style={{ width: 20, height: 20 }} />
                    <View style={{ paddingHorizontal: 10 }}>
                        <Typography size={15} style={{ paddingVertical: 5 }} color={colors.textBody} variant="regular">{item?.StartAddress}</Typography>
                    </View>
                </View> */}

                <View style={styles.row}>
                    <Image source={images.pencil} resizeMode="contain"
                        style={{ width: 20, height: 20 }} />
                    <View style={{ paddingHorizontal: 10 }}>
                        <Typography size={15} style={{ paddingVertical: 5 }} color={colors.textBody} variant="regular">Duration: {setDateHandler(item?.Duration)}</Typography>
                    </View>
                </View>
            </View>
        );
    };


    return (
        <View style={styles.root}>
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
                    onPress={calenderHandler}
                >
                    <Image source={images.calendarIcon} resizeMode="contain"
                        style={{ width: 20, height: 20 }} />
                </TouchableOpacity>
            </View>
            {
                trackerIDWise.length > 1 ?
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

            <View style={styles.container}>
                <View style={styles.subContainer}>
                    <Typography size={16} color={colors.textSecondary} variant="regular">Total Parked time</Typography>
                    <Typography style={{ marginVertical: 5 }} size={24} color={colors.textBody} variant="bold">{timeConvert(totalMin)} </Typography>
                </View>
                <Typography style={{ paddingHorizontal: responsiveWidth(5), marginTop: 10 }}>
                    <Typography size={16} color={colors.textSecondary} variant="regular">Total Parkings: </Typography>
                    <Typography size={16} color={colors.textPrimary} variant="bold">{totalStops}</Typography>
                </Typography>
            </View>
            {
                isLoading ?
                    <LoaderView /> :
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={saveData}
                        renderItem={renderData}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={{ flexGrow: 1 }}
                        style={{ flex: 1 }}
                        ListEmptyComponent={<EmptyComponent title="No Data Found" />}
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
    subContainer: {
        borderBottomWidth: 0.5,
        borderBottomColor: colors.black,
        paddingHorizontal: responsiveWidth(5),
        paddingVertical: responsiveHeight(1),
        paddingBottom: responsiveHeight(2),
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
        borderRadius: 7,
        paddingVertical: responsiveHeight(1),
        marginVertical: responsiveHeight(2),
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
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
    input: {
        backgroundColor: colors.white,
        borderColor: colors.black,
        borderWidth: 0.1,
        borderRadius: 1,
        padding: 4,
        color: colors.black,
        marginBottom: 10,
    },
});

export default ParkedReport;
