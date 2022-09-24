import images from '#assets/';
import LoaderView from '#common/LoaderView';
import Typography from '#common/Typography';
import { Service } from '#config/service';
import { colors } from '#res/colors';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { LineChart } from 'react-native-chart-kit';
import { TouchableOpacity } from 'react-native';
import Modal from '#common/Modal';
import ComplaintModalList from '#common/ComplaintModalList';

const chartConfig = {
    backgroundGradientFrom: colors.white,
    backgroundGradientFromOpacity: 0.3,
    backgroundGradientTo: colors.white,
    backgroundGradientToOpacity: 0.2,
    color: (opacity = 1) => `rgba(25, 48, 159, ${0.1})`, // optional
    barPercentage: 0,
    useShadowColorFromDataset: false, // optional
    decimalPlaces: 0,
};


const SpeedDashboard = ({ navigation }) => {

    const { userData: { AccountID } } = useSelector(state => state.userReducer);
    const [isLoading, setIsLoading] = useState(false);
    const [trackerId, setTrackerID] = useState('');
    const [speedData, setSpeedData] = useState('');
    const [typeSelectedData, setTypeSelectedData] = useState('');
    const [typeModalVisible, setTypeModalVisible] = useState(false);
    const [trackerIDWise, setTrackerIdWise] = useState('');


    const [data, setData] = useState({
        datasets: [{
            labels: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri'],
            data: [0, 0, 0, 0, 0],
            color: (opacity = 1) => `rgba(255, 152, 0, ${0.2})`, // optional
            barColors: ['blue'],
        }],
    });
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
            if (Data?.length === 1) {
                setTrackerID(Data[0]?.TrackerID);
                // await getSpeedReportHandler((Data[0]?.TrackerID));
                await getReportsHandler(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), new Date(), (Data[0]?.TrackerID));
            }
            else {
                setTrackerIdWise(Data[0].Data);
            }

        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };


    // const getSpeedReportHandler = async (_trackerId) => {
    //     const obj = {
    //         AccountID: AccountID,
    //         TrackerID: _trackerId,
    //         fromDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    //         toDate: new Date(),
    //     };
    //     setIsLoading(true);
    //     try {
    //         const { Data } = await Service.speedMilageReport(obj);
    //         if (Data[0].VehicleMilage === 'Not Set') {
    //             showAlert();
    //         } else {
    //             setSpeedData(Data[0]);
    //         }
    //     } catch (error) {
    //         console.log('Inside Catch => ', error);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const getReportsHandler = async (_from, _to, _trackerId) => {
        const obj = {
            TrackerID: _trackerId ?? trackerId,
            fromDate: _from,
            toDate: _to,
        };
        setIsLoading(true);
        try {
            const { Data } = await Service.weeklyAvgSpeed(obj);
            setSpeedData(Data[0]);

            if (Data) {
                let updatedArray = [];
                let updatedDay = [];
                for (const key in Data) {
                    const { AvgSpeed, Day } = Data[key];
                    updatedArray.push(AvgSpeed);
                    updatedDay.push(Day);
                }
                setData({
                    labels: updatedDay,
                    datasets: [{
                        data: updatedArray,
                        color: (opacity = 1) => colors.graphPrimary, // optional
                    }],
                });
            }
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const showAlert = () => {
        Alert.alert(
            'Milage',
            'Your Milage is not Set',
            [
                {
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
    };

    const newsPressHandler = async (_value) => {
        setTrackerID(_value.TrackerID);
        setTypeSelectedData(_value);
        setTypeModalVisible(false);
        await getReportsHandler(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), new Date(), _value.TrackerID);
        // await getSpeedReportHandler(_value.TrackerID);
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
                            speedData ?
                                <>

                                    <View style={styles.row}>
                                        <View style={[styles.item, { width: '48%', paddingVertical: responsiveHeight(3.5), marginVertical: responsiveHeight(4) }]} >
                                            <Image source={images.AvgSpeed} resizeMode="contain"
                                                style={{ width: 70, height: 70, marginBottom: 6 }} />
                                            <Typography style={{ marginTop: 10 }} variant="bold" >{speedData?.AvgSpeed} km/h</Typography>
                                            <Typography color={colors.textSecondary} variant="regular" >Avg Speed</Typography>
                                        </View>
                                        <View style={[styles.item, { width: '48%', paddingVertical: responsiveHeight(3.5) }]} >
                                            <Image source={images.IdleTime} resizeMode="contain"
                                                style={{ width: 70, height: 70, marginBottom: 6 }} />
                                            <Typography style={{ marginTop: 10 }} variant="bold" >{speedData?.MaxSpeed} km/h</Typography>
                                            <Typography color={colors.textSecondary} variant="regular" >Max Speed</Typography>
                                        </View>
                                    </View>

                                    {/* <Typography size={20} style={{ marginVertical: responsiveHeight(2), marginTop: responsiveHeight(5), paddingHorizontal: 5 }} variant="bold" >Speed</Typography> */}
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
        backgroundColor: colors.backgroundWhite,
        // justifyContent: 'center',
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

        // paddingVertical: responsiveHeight(4),
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // marginVertical: responsiveHeight(20)
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

export default SpeedDashboard;
