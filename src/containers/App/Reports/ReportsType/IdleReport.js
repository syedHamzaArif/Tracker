import images from '#assets/';
import EmptyComponent from '#common/EmptyComponent';
import LoaderView from '#common/LoaderView';
import Typography from '#common/Typography';
import { Service } from '#config/service';
import { AuthContext } from '#context/';
import { colors } from '#res/colors';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import React, { useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { View, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from '#common/Button';
import Modal from '#common/Modal';
import { getDate } from '#util/';
import moment from 'moment';
import ComplaintModalList from '#common/ComplaintModalList';

const IdleReport = ({ navigation }) => {

    const { userData } = useSelector(state => state.userReducer);


    const [saveData, setSaveData] = useState([]);
    const [trackerIDWise, setTrackerIdWise] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [filterBackground, setFilterBackground] = useState('1');
    const [trackerId, setTrackerID] = useState('');
    const [totalStops, setTotalSteps] = useState(0);
    const [totalMin, setTotalMin] = useState(0);
    const [typeModalVisible, setTypeModalVisible] = useState(false);
    const [dateModalVisible, setDateModalVisible] = useState(false);
    const [dateView, setDateView] = useState(false);
    const [typeSelectedData, setTypeSelectedData] = useState('');

    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);

    const [dateFrom, setDateFrom] = useState(new Date());
    const [modeFrom, setModeFrom] = useState('date');
    const [showFrom, setShowFrom] = useState(false);

    const { showAuthFailModal } = useContext(AuthContext);

    useEffect(() => {
        getTrackerIDWiseHandler();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getTrackerIDWiseHandler = async () => {
        setIsLoading(true);
        try {
            const { Data } = await Service.getTrackerIDWise(userData.AccountID);
            if (Data.length === 1) {
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
        getTripsHandler(dateFrom, date);
    };

    const getTripsHandler = async (_from, _to, _trackerId) => {

        const obj = {
            AccountID: userData.AccountID,
            TrackerID: _trackerId ? _trackerId : trackerId,
            fromDate: _from,
            toDate: _to,
            IsIdleTrip: true,
            IdleMaxMin: 1,
        };
        setIsLoading(true);
        try {
            const { Data } = await Service.getAllTrips(obj);
            if (Data) {
                console.log('if');
                setTotalSteps(Data[0].TotalItem);
                setTotalMin(Data[0].IdleMins);
                // timeConvert(Data[0].IdleMins);
                setSaveData(Data[0].ItemArray);
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
    const timeConvert = (n) => {
        var num = n;
        var hours = (num / 60);
        var rHours = Math.floor(hours);
        var minutes = (hours - rHours) * 60;
        var rMinutes = Math.round(minutes);
        if (rHours) {
            return rHours + ' hr, ' + rMinutes + ' mins';
        } else {
            return rMinutes + ' mins';
        }
    };

    //To
    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(Platform.OS === 'ios');
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
    const onChangeFrom = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowFrom(Platform.OS === 'ios');
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
            getTripsHandler(new Date(), new Date());
        }
        else if (_type === 'yesterday') {
            setFilterBackground('2');
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yest = yesterday.toDateString();
            setDate(yest);
            setDateFrom(yest);
            getTripsHandler(yest, yest);
        }
        else if (_type === 'week') {
            setFilterBackground('3');
            const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const today = new Date();
            setDateFrom(week);
            setDate(today);
            getTripsHandler(week, today);
        } else {
            setFilterBackground('0');
        }
    };

    const newsPressHandler = (_value) => {
        setTrackerID(_value.TrackerID);
        setTypeSelectedData(_value);
        setTypeModalVisible(false);
        // setFilterBackground('1');
        // getTripsHandler(new Date(), new Date(), _value.TrackerID);
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
            updatedDate = `${updateMinute} mins`;
            // setDuration(updatedDate);
            return updatedDate;
        }
        else {
            updatedDate = `${updateHour} hr ${updateMinute} mins`;
            // setDuration(updatedDate);
            return updatedDate;

        }
    };


    const renderData = ({ item }) => {
        return (
            <TouchableOpacity style={styles.itemContainer} activeOpacity={0.7}
                onPress={() => navigation.navigate('Idle Stops', { TripID: item?.Data?.TripID })}
            >
                <Typography>
                    <Typography color={colors.textBody} variant="regular">{moment(item?.Data?.IgnitionOnDateTime?.split('T')[0]).format('DD-MM-YYYY')}</Typography>
                    <Typography color={colors.textSecondary} variant="small">   {item?.Data?.IgnitionOnDateTime?.split('T')[1]}</Typography>
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
                        <Typography size={15} style={{ paddingVertical: 5 }} color={colors.textBody} variant="regular">Idle Duration: {setDateHandler(item?.Duration)}</Typography>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };


    return (
        <View style={styles.root}>
            {show && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode={mode}
                    maximumDate={Date.now()}
                    is24Hour={true}
                    display="calendar"
                    onChange={onChange}
                />
            )}
            {showFrom && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={dateFrom}
                    mode={modeFrom}
                    is24Hour={true}
                    maximumDate={Date.now()}
                    display="calendar"
                    onChange={onChangeFrom}
                />
            )}

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
                    <Typography size={16} color={colors.textSecondary} variant="regular">Total Idle time</Typography>
                    <Typography style={{ marginVertical: 5 }} size={24} color={colors.textBody} variant="bold">{timeConvert(totalMin)} </Typography>

                </View>
                <Typography style={{ paddingHorizontal: responsiveWidth(5), marginTop: 10 }}>
                    <Typography size={16} color={colors.textSecondary} variant="regular">Idle Stops: </Typography>
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

export default IdleReport;
