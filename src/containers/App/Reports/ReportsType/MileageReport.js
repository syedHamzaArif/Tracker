import images from '#assets/';
import ComplaintModalList from '#common/ComplaintModalList';
import LoaderView from '#common/LoaderView';
import Modal from '#common/Modal';
import Typography from '#common/Typography';
import { Service } from '#config/service';
import { colors } from '#res/colors';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import { useFocusEffect } from '@react-navigation/core';
import React, { useCallback, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Alert } from 'react-native';
import { View, StyleSheet, Image } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSelector } from 'react-redux';

const chartConfig = {
    backgroundGradientFrom: colors.white,
    backgroundGradientFromOpacity: 0.3,
    backgroundGradientTo: colors.white,
    backgroundGradientToOpacity: 0.2,
    color: (opacity = 1) => `rgba(25, 48, 159, ${0.1})`, // optional
    // color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`, // optional
    barPercentage: 0,
    useShadowColorFromDataset: false, // optional
    decimalPlaces: 0,
};

const MileageReport = ({ navigation }) => {

    const { userData: { AccountID } } = useSelector(state => state.userReducer);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState({
        datasets: [{
            labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            data: [0, 0, 0, 0, 0],
            color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`, // optional
        }],
    });

    const [trackerId, setTrackerID] = useState('');
    const [speedData, setSpeedData] = useState('');
    const [typeSelectedData, setTypeSelectedData] = useState('');
    const [typeModalVisible, setTypeModalVisible] = useState(false);
    const [trackerIDWise, setTrackerIdWise] = useState('');

    useFocusEffect(
        useCallback(() => {
            getTrackerIDWiseHandler();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])
    );

    const getTrackerIDWiseHandler = async () => {
        setIsLoading(true);
        try {
            const { Data } = await Service.getTrackerIDWise(AccountID);
            setSpeedData(Data[0]);

            if (Data?.length === 1) {
                setTrackerID(Data[0]?.TrackerID);
                await getReportsHandler(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), new Date(), (Data[0]?.TrackerID));
                // await getSpeedReportHandler((Data[0]?.TrackerID));
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

    const getReportsHandler = async (_from, _to, _trackerId, _mileage) => {

        const obj = {
            AccountID: AccountID,
            TrackerID: _trackerId ?? trackerId,
            fromDate: _from,
            toDate: _to,
        };
        setIsLoading(true);
        try {
            const { Data } = await Service.getDistanceReport(obj);
            setSpeedData(Data[0]);
            const arrayDestructed = Data[0].Data;
            console.log('file: MileageReport.js => line 88 => getReportsHandler => arrayDestructed', arrayDestructed);

            if (arrayDestructed) {
                let updatedArray = [];
                let updatedDay = [];
                for (const key in arrayDestructed) {
                    const { TotalDistance, Day } = arrayDestructed[key];
                    updatedArray.push(TotalDistance);
                    updatedDay.push(Day);
                }
                setData({
                    labels: updatedDay,
                    datasets: [{
                        data: updatedArray,
                        color: (opacity = 1) => `rgba(0, 205, 234, ${opacity})`, // optional
                    }],
                });
            }
        } catch (error) {
            console.log('file: MileageReport.js => line 106 => getReportsHandler => error', error);
        } finally {
            setIsLoading(false);
        }
    };



    const getSpeedReportHandler = async (_trackerId) => {
        const obj = {
            AccountID: AccountID,
            TrackerID: _trackerId,
        };
        setIsLoading(true);
        try {
            const { Data } = await Service.speedMilageReport(obj);
            if (Data[0].VehicleMilage === 'Not Set') {
                showAlert();
            } else {
                setSpeedData(Data[0]);
                await getReportsHandler(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), new Date(), _trackerId, Data[0].VehicleMilage);
            }
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const showAlert = () =>
        Alert.alert(
            'Milage',
            'Your Milage is not Set',
            [
                {
                    cancelable: true,
                    onPress: () => navigation.goBack(),
                    style: 'cancel',
                    text: 'Cancel',
                },
                {
                    text: 'Set Milage',
                    onPress: () => navigation.navigate('Mileage Set'),
                    style: 'default',
                },
            ],
        );



    const newsPressHandler = async (_value) => {
        setTrackerID(_value.TrackerID);
        setTypeSelectedData(_value);
        setTypeModalVisible(false);
        await getSpeedReportHandler(_value.TrackerID);
    };

    return (
        <View style={styles.root}>
            {
                isLoading ?
                    <LoaderView /> :
                    <>
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
                            speedData ? <>

                                <View style={styles.container}>
                                    <View style={styles.subContainer}>
                                        <View>
                                            <Typography size={18} color={colors.textSecondary} >Fuel Consumption</Typography>
                                            <Typography>
                                                <Typography style={{ marginVertical: 5 }} size={30} color={colors.textBody} variant="bold">{speedData?.Milage?.toFixed(2)}</Typography>
                                                <Typography style={{ marginVertical: 5 }} size={24} color={colors.textSecondary} variant="regular">{'\tltr'}</Typography>
                                            </Typography>
                                        </View>
                                        <Image source={images.speedReport} resizeMode="contain"
                                            style={{ width: 70, height: 70 }} />
                                    </View>
                                    <Typography style={{ paddingHorizontal: responsiveWidth(5), marginTop: 10 }}>
                                        <Typography>
                                            <Typography size={16} color={colors.textBody} variant="regular">Your Vehicle Mileage:</Typography>
                                            <Typography size={15} color={colors.textSecondary} variant="regular">{`\t ${parseInt(speedData?.VehicleMilage)} km/ltr`}</Typography>
                                        </Typography>
                                    </Typography>
                                </View>

                                <Typography size={20} style={{ marginVertical: 10, marginTop: responsiveHeight(10), paddingHorizontal: 5 }} variant="bold" >Mileage Graph</Typography>

                                <View style={styles.item}>

                                    <LineChart
                                        data={data}
                                        width={responsiveWidth(95)}
                                        height={220}
                                        chartConfig={{
                                            ...chartConfig, propsForDots: {
                                                stroke: colors.primaryBlue,
                                                fill: colors.primaryBlue,
                                            },
                                            strokeWidth: 2,

                                            scrollableDotStrokeColor: () => 'red',
                                            labelColor: () => colors.primaryBlue,
                                        }}
                                        yAxisSuffix=" km/h"
                                        segments={3}
                                        bezier
                                        renderDotContent={({ x, y, index }) => {
                                            return (
                                                <View key={index} style={{
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: 10,
                                                    backgroundColor: colors.backgroundWhite,
                                                    position: 'absolute',
                                                    top: y - 10,
                                                    left: x - 10,
                                                    borderWidth: 5,
                                                    borderColor: index % 2 === 0 ? colors.primary : colors.graphPrimary,
                                                }} />

                                            );
                                        }}
                                        fromZero
                                        style={{ borderRadius: 10, marginTop: responsiveHeight(5) }}
                                    />
                                </View>
                            </> : null
                        }
                    </>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        paddingHorizontal: 10,
        // justifyContent: 'space-around',
        backgroundColor: colors.background,
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
    subContainer: {
        borderBottomWidth: 0.5,
        borderBottomColor: colors.black,
        paddingHorizontal: responsiveWidth(5),
        paddingVertical: responsiveHeight(1),
        paddingBottom: responsiveHeight(2),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    item: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        backgroundColor: colors.white,
        elevation: 5,
        marginVertical: responsiveHeight(1),
        alignItems: 'center',
        borderRadius: 10,
        overflow: 'hidden',
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

export default MileageReport;
