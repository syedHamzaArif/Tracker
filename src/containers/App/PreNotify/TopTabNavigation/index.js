
import React, { useCallback, useContext, useLayoutEffect, useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import PreNotify from '..';
import Battery from '../Battery';
import NoGoAreas from '../NoGoAreas';
import Button from '#common/Button';
import { colors } from '#res/colors';
import { getFonts, hitSlop } from '#util/';
import Modal from '#common/Modal';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import Typography from '#common/Typography';
import { View, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import images from '#assets/';
import { Checkbox } from 'react-native-paper';
import ComplaintModalList from '#common/ComplaintModalList';
import { Service } from '#config/service';
import { getDate } from '#util/';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/core';
import { AuthContext } from '#context/';
import ModalDatePicker from 'react-native-modal-datetime-picker';

let FailedDetails = {
    message: 'PreNotification Status',
    type: 'info',
    duration: 2400,
    position: 'top',
    description: 'Failed To Add Pre-Notification',
    titleStyle: { fontSize: 18 },
    textStyle: { fontSize: 12 },
    backgroundColor: colors.primary,
    color: colors.textPrimary,
    hideOnPress: true,
    floating: true,
};

const Tab = createMaterialTopTabNavigator();
const TopTabNavigation = ({ navigation }) => {

    const { userData: { AccountID } } = useSelector(state => state.userReducer);

    const [notificationModal, setNotificationModal] = useState(false);
    const [cityData, setCityData] = useState('');
    const [checked, setChecked] = useState(false);
    const [areaChecked, setAreaChecked] = useState(false);
    const [data, setData] = useState('');
    const [deleteItem, setDeleteItem] = useState('');
    const [batteryData, setBatteryData] = useState('');
    const [noAreaData, setNoAreaData] = useState('');
    //modal states
    const [areaModalVisible, setAreaModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const { showFlashMessage } = useContext(AuthContext);

    //selected data

    const [isLoading, setIsLoading] = useState(false);

    const [date, setDate] = useState(new Date());
    // const [time, setTime] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);

    const [dateFrom, setDateFrom] = useState(new Date());
    // const [timeFrom, setTimeFrom] = useState(new Date());
    const [modeFrom, setModeFrom] = useState('date');
    const [showFrom, setShowFrom] = useState(false);

    const [selectedCityData, setSelectedCityData] = useState('');

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: {
                elevation: 0,
                shadowOpacity: 0,
            },
        });
    }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            getCityHandler();
            getPreNotifyHandler();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [deleteHandler])
    );


    const getCityHandler = async () => {
        try {
            const { Data } = await Service.getCityList();
            setCityData(Data);
        } catch (error) {
            console.log('Inside Catch => ', error);
        }
    };
    const getPreNotifyHandler = async () => {
        setIsLoading(true);
        try {
            const { Data } = await Service.getPreNotify(AccountID);
            if (Data) {
                const batteryFilter = Data.filter(item => item.NotifTypeID === 1);
                const noGoAreaFilter = Data.filter(item => item.NotifTypeID === 2);
                setBatteryData(batteryFilter);
                setNoAreaData(noGoAreaFilter);
                setData(Data);
            }
            else {
                setData([]);
                setBatteryData([]);
                setNoAreaData([]);
            }
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const cityPressHandler = (_value) => {
        setSelectedCityData(_value);
        setAreaModalVisible(false);
    };


    // To
    const onChange = (selectedDate) => {
        if (mode === 'date') {
            const currentDate = selectedDate || date;
            console.log('file: index.js => line 131 => onChange => currentDate', currentDate);
            setShow(false);
            setDate(currentDate);
            // showTimePicker();
        } else if (mode === 'time') {
            setShow(Platform.OS === 'ios');
            // setTime(selectedDate);
        }
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
        if (modeFrom === 'date') {
            const currentDate = selectedDate || date;
            console.log('file: index.js => line 152 => onChangeFrom => currentDate', currentDate);
            // setShowFrom(Platform.OS === 'ios');
            setShowFrom(false);
            setDateFrom(currentDate);
            // showTimePickerFrom();
        } else if (modeFrom === 'time') {
            setShowFrom(Platform.OS === 'ios');
            // setTimeFrom(selectedDate);
        }
    };
    const showModeFrom = (currentMode) => {
        setShowFrom(true);
        setModeFrom(currentMode);
    };

    const showDatepickerFrom = () => {
        showModeFrom('date');
    };

    const saveHandler = async () => {


        setNotificationModal(false);
        const dataObj = {
            CustAccID: AccountID,
            AreaID: selectedCityData ? selectedCityData.ID : null,
            NotifTypeID: checked ? 1 : 2,
            FromDate: getDate(dateFrom),
            ToDate: getDate(date),
            // FromDate: getDate(dateFrom) + ' ' + getTime(timeFrom),
            // ToDate: getDate(date) + ' ' + getTime(time),
        };
        setIsLoading(true);
        try {
            const { Message } = await Service.addDeletePreNotify(dataObj);
            if (Message === 'Battery Tampered Saved!' || Message === 'No Go Area Saved!') {
                showFlashMessage({
                    message: 'Pre-Notification Status',
                    type: 'info',
                    duration: 2400,
                    position: 'top',
                    description: Message,
                    titleStyle: { fontSize: 18 },
                    textStyle: { fontSize: 12 },
                    backgroundColor: colors.primary,
                    color: colors.textPrimary,
                    hideOnPress: true,
                    floating: true,
                });
                getPreNotifyHandler();
            }
            else {
                console.log('failed');
                showFlashMessage(FailedDetails);
            }
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteHandler = async (i) => {
        setConfirmModalVisible(false);
        const DeleteObj = {
            ID: deleteItem.ID,
            IsDeleted: true,
        };
        setIsLoading(true);
        try {
            const { Message } = await Service.addDeletePreNotify(DeleteObj);
            if (Message === 'Pre-Notification Deleted!') {
                showFlashMessage({
                    message: 'PreNotification Status',
                    type: 'info',
                    duration: 2400,
                    position: 'top',
                    description: 'Delete Pre-Notification Successfully',
                    titleStyle: { fontSize: 18 },
                    textStyle: { fontSize: 12 },
                    backgroundColor: colors.primary,
                    color: colors.textPrimary,
                    hideOnPress: true,
                    floating: true,
                });
                getPreNotifyHandler();
            }
            else {
                showFlashMessage({
                    message: 'PreNotification Status',
                    type: 'info',
                    duration: 2400,
                    position: 'top',
                    description: 'Failed To Add Pre-Notification',
                    titleStyle: { fontSize: 18 },
                    textStyle: { fontSize: 12 },
                    backgroundColor: colors.primary,
                    color: colors.textPrimary,
                    hideOnPress: true,
                    floating: true,
                });
            }
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Tab.Navigator
                // lazy={true}
                backBehavior="initialRoute"
                // initialRouteName="ALL"
                tabBarOptions={{
                    activeTintColor: colors.primary,
                    inactiveTintColor: colors.textPrimary,
                    indicatorStyle: { backgroundColor: colors.primary },
                    labelStyle: { fontFamily: getFonts().bold },
                }}
            >

                {/* <Tab.Screen name="ALL" component={PreNotify} /> */}
                <Tab.Screen name="Home">
                    {props => <PreNotify {...props} data={data} isLoading={isLoading} deleteHandler={(item) => {
                        setDeleteItem(item);
                        setConfirmModalVisible(true);
                    }} />}
                </Tab.Screen>
                <Tab.Screen name="BATTERY">
                    {props => <Battery {...props} data={batteryData} isLoading={isLoading} deleteHandler={(item) => {
                        setDeleteItem(item);
                        setConfirmModalVisible(true);
                    }} />}
                </Tab.Screen>
                <Tab.Screen name="NO GO AREAS">
                    {props => <NoGoAreas {...props} data={noAreaData} isLoading={isLoading} deleteHandler={(item) => {
                        setDeleteItem(item);
                        setConfirmModalVisible(true);
                    }} />}
                </Tab.Screen>

            </Tab.Navigator>
            <Button style={{ margin: 20 }}
                onPress={() => setNotificationModal(true)}
                variant="black"
                title="ADD NEW PRE-NOTIFICATION" />

            <Modal
                setVisible={setNotificationModal}
                visible={notificationModal}
                style={{
                    justifyContent: 'flex-start',
                    marginTop: areaChecked ? responsiveHeight(20) : responsiveHeight(31),
                    margin: 0,
                }}
            >
                <View style={styles.bottomContainer}>
                    {/* *******Heading******* */}
                    <View style={styles.headingStyle}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View />
                            <Typography size={16} variant="bold">Add Pre-Notification</Typography>
                            <TouchableOpacity
                                onPress={() => setNotificationModal(false)}
                                hitSlop={hitSlop}
                            >
                                <Image source={images.cross} resizeMode="contain"
                                    style={{ width: responsiveWidth(5), height: responsiveWidth(5) }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/********Select Notification********/}

                    <TouchableOpacity style={[styles.selectView, {
                        borderColor: checked ? colors.primary : colors.backgroundWhite,
                    }]}
                        onPress={() => {
                            setChecked(!checked);
                            setAreaChecked(false);
                        }}
                    >
                        <View>
                            <Typography color={checked ? colors.primary : colors.textPrimary} size={16} variant="bold">BATTERY TEMPER</Typography>
                            <Typography color={checked ? colors.primary : colors.textSecondary} size={14} variant="small">Faults in the battery</Typography>
                        </View>
                        <Checkbox
                            status={checked ? 'checked' : 'unchecked'}
                            color={colors.primary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.selectView, {
                        borderColor: areaChecked ? colors.primary : colors.backgroundWhite,
                    }]}
                        onPress={() => {
                            setAreaChecked(!areaChecked);
                            setChecked(false);
                        }}
                    >
                        <View>
                            <Typography color={areaChecked ? colors.primary : colors.textPrimary} size={16} variant="bold">NO GO AREAS</Typography>
                            <Typography color={areaChecked ? colors.primary : colors.textSecondary} size={14} variant="small">Areas published from travelling</Typography>
                        </View>
                        <Checkbox
                            status={areaChecked ? 'checked' : 'unchecked'}
                            color={colors.primary}
                        />
                    </TouchableOpacity>

                    {/* *******Select No Go Area******* */}
                    {
                        areaChecked ? <>
                            <Typography style={{ marginHorizontal: responsiveWidth(4) }} color={colors.textSecondary} size={14} variant="medium">SELECT NO GO AREA</Typography>
                            <TouchableOpacity style={[styles.selectView]}
                                onPress={() => setAreaModalVisible(true)}
                            >
                                <Typography variant="medium">{selectedCityData.Value ? selectedCityData.Value : 'Select Area'}</Typography>
                                <Modal
                                    setVisible={setAreaModalVisible}
                                    visible={areaModalVisible}
                                    style={{ justifyContent: 'flex-start', paddingVertical: responsiveHeight(5) }}
                                >
                                    <ComplaintModalList
                                        data={cityData}
                                        pressHandler={cityPressHandler}
                                        heading={'Select Area'}
                                    />
                                </Modal>
                            </TouchableOpacity>
                        </> : null
                    }
                    {/* *******Start time******* */}

                    <Typography style={{ marginHorizontal: responsiveWidth(4) }}
                        color={colors.textSecondary} size={14} variant="medium">START DATE/TIME</Typography>
                    <TouchableOpacity style={[styles.selectView]}
                        onPress={showDatepickerFrom}
                    >
                        <Typography variant="bold">{getDate(dateFrom)}</Typography>
                        {/* <Typography variant="bold">{getDate(dateFrom)}  {getTime(timeFrom)}</Typography> */}
                    </TouchableOpacity>

                    {/* *******End time******* */}

                    <Typography style={{ marginHorizontal: responsiveWidth(4) }} color={colors.textSecondary}
                        size={14} variant="medium">END DATE/TIME</Typography>
                    <TouchableOpacity style={[styles.selectView]}
                        onPress={showDatepicker}
                    >
                        <Typography variant="bold">{getDate(date)} </Typography>
                        {/* <Typography variant="bold">{getDate(date)} {getTime(time)} </Typography> */}
                    </TouchableOpacity>
                    <Button style={{ margin: 15 }} onPress={saveHandler} variant="black" title="Apply" />

                </View>
                <ModalDatePicker
                    isVisible={showFrom}
                    value={dateFrom}
                    mode="datetime"
                    is24Hour={true}
                    minimumDate={new Date()}
                    display="spinner"
                    // display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onConfirm={onChangeFrom}
                    onCancel={setShowFrom.bind(this, false)}
                />


                <ModalDatePicker
                    isVisible={show}
                    value={date}
                    disabled={!dateFrom}
                    mode="datetime"
                    is24Hour={true}
                    minimumDate={dateFrom ?? new Date()}
                    display="spinner"
                    onConfirm={onChange}
                    onCancel={setShow.bind(this, false)}
                />
            </Modal>
            {/* confirm */}
            <Modal
                setVisible={setConfirmModalVisible}
                visible={confirmModalVisible}
            >
                <View style={styles.modalStyle}>
                    <Typography size={16}
                        style={{ marginVertical: 15 }}
                        variant="bold">Are You Sure?</Typography>
                    <Typography size={16}
                        align="center"
                        color={colors.textSecondary}
                        style={{ marginVertical: 5, paddingHorizontal: 50 }}
                        variant="small">Are you sure you want to delete Pre-Notification?</Typography>
                    <View style={styles.row}>
                        <TouchableOpacity style={[styles.modalButton]} onPress={() => setConfirmModalVisible(false)}>
                            <Typography color={colors.textSecondary} size={16} align="center" variant="small">No</Typography>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton]} onPress={deleteHandler}>
                            <Typography size={16} variant="medium" align="center" style={{ color: colors.primary }} >Yes</Typography>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    bottomContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor: colors.white,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
        borderWidth: 5,
        borderColor: colors.backgroundWhite,
    },
    headingStyle: {
        backgroundColor: colors.background,
        borderBottomColor: colors.textSecondary,
        borderBottomWidth: 0.2,
        justifyContent: 'space-between',
        paddingVertical: 17,
        padding: 10,
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
    modalStyle: {
        backgroundColor: colors.background,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        paddingTop: responsiveHeight(3),
        alignItems: 'center',
    },
    modalButton: {
        width: '50%',
        // borderWidth: 0.25,
        borderColor: colors.textBody,
        paddingVertical: responsiveHeight(2),
        marginTop: responsiveHeight(2),
    },
    row: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
});

export default TopTabNavigation;
