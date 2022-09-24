import images from '#assets/';
import LoaderView from '#common/LoaderView';
import Typography from '#common/Typography';
import { Service } from '#config/service';
import { colors } from '#res/colors';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useSelector } from 'react-redux';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import Modal from '#common/Modal';
import ComplaintModalList from '#common/ComplaintModalList';
import { TouchableOpacity } from 'react-native';


const DistanceReport = ({ navigation }) => {

    const { userData: { UserName, AccountID } } = useSelector(state => state.userReducer);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState({
        datasets: [{
            labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            data: [0, 0, 0, 0, 0],
            // color: (opacity = 1) => `rgba(0, 205, 234, ${opacity})`, // optional
            color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`, // optional
        }],
    });

    const [trackerId, setTrackerID] = useState('');
    const [speedData, setSpeedData] = useState();
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
            if (Data?.length === 1) {
                setTrackerID(Data[0]?.TrackerID);
                await getReportsHandler(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), new Date(), (Data[0]?.TrackerID));
            }
            else {
                setTrackerIdWise(Data);
            }
        } catch (error) {
            console.log('file: DistanceReport.js => line 56 => getTrackerIDWiseHandler => error', error);
        } finally {
            setIsLoading(false);
        }
    };


    const getReportsHandler = async (_from, _to, _trackerId) => {
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
            if (arrayDestructed) {
                let updatedArray = [];
                let updatedDay = [];
                for (const key in arrayDestructed) {
                    const { TotalDistance, Day } = arrayDestructed[key];
                    console.log('file: DistanceReport.js => line 79 => getReportsHandler =>  TotalDistance, Day ', TotalDistance, Day);
                    updatedArray.push(TotalDistance);
                    updatedDay.push(Day);
                }
                setData({
                    labels: updatedDay,
                    datasets: [{
                        data: updatedArray,
                        // color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`, // optional
                        color: (opacity = 1) => `rgba(25, 48, 159, ${0.3})`, // optional
                    }],
                });
            }
        } catch (error) {
            console.log('file: DistanceReport.js => line 92 => getReportsHandler => error', error);
        } finally {
            setIsLoading(false);
        }
    };

    // const getSpeedReportHandler = async (_trackerId) => {
    //     const obj = {
    //         AccountID: AccountID,
    //         TrackerID: _trackerId,
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
    //         console.log('file: DistanceReport.js => line 112 => getSpeedReportHandler => error', error);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // const showAlert = () => {
    //     Alert.alert(
    //         'Milage',
    //         'Your Milage is not Set',
    //         [
    //             {
    //                 onPress: () => navigation.goBack(),
    //                 style: 'cancel',
    //                 text: 'Cancel',
    //             },
    //             {
    //                 text: 'Set Milage',
    //                 onPress: () => navigation.navigate('Mileage Set'),
    //                 style: 'default',
    //             },
    //         ],
    //     );
    // };

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
                                    <View style={styles.container}>
                                        <View>
                                            <Typography style={{ textTransform: 'uppercase' }} size={20} variant="bold">{speedData.Data[0]?.RegNumber}</Typography>
                                            <Typography color={colors.textSecondary} size={20} variant="regular">{UserName}</Typography>
                                        </View>
                                        <Image source={images.speedReport} resizeMode="contain"
                                            style={{ width: 70, height: 70 }} />
                                    </View>

                                    <View style={[styles.containerFooter, { flexDirection: 'row', justifyContent: 'space-around' }]}>
                                        <View style={{ alignItems: 'center' }}>
                                            <Typography size={16} color={colors.primary} variant="bold">{speedData?.WeeklyAvgSpeed} km/h</Typography>
                                            <View style={styles.row}>
                                                <Image source={images.speed} resizeMode="contain"
                                                    style={{ width: 22, height: 22, tintColor: colors.black, marginHorizontal: responsiveHeight(0.5) }} />
                                                <Typography size={16} variant="regular">Speed</Typography>
                                            </View>
                                        </View>
                                        <View style={{ alignItems: 'center' }}>
                                            <Typography size={16} color={colors.primary} variant="bold">{speedData?.Milage?.toFixed(2)} ltr</Typography>
                                            <View style={styles.row}>
                                                <Image source={images.reports2} resizeMode="contain"
                                                    style={{ width: 22, height: 22, tintColor: colors.black, marginHorizontal: responsiveHeight(0.5) }} />
                                                <Typography size={16} variant="regular">Fuel</Typography>
                                            </View>
                                        </View>
                                        <View style={{ alignItems: 'center' }}>
                                            <Typography size={16} color={colors.primary} variant="bold">{speedData?.Distance ? speedData?.Distance?.toFixed(2) : 0} km</Typography>
                                            <View style={styles.row}>
                                                <Image source={images.reports8} resizeMode="contain"
                                                    style={{ width: 22, height: 22, tintColor: colors.black, marginHorizontal: responsiveHeight(0.5) }} />
                                                <Typography size={16} variant="regular">Distance</Typography>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.item}>
                                        <BarChart
                                            // style={graphStyle}
                                            data={data}
                                            width={responsiveWidth(95)}
                                            height={270}
                                            yAxisSuffix=" km"
                                            // withCustomBarColorFromData={true}
                                            flatColor={true}
                                            chartConfig={{
                                                backgroundGradientFrom: colors.white,
                                                backgroundGradientFromOpacity: 0,
                                                backgroundGradientTo: colors.white,
                                                backgroundGradientToOpacity: 0.1,
                                                color: (opacity = 1) => colors.primary,
                                                barPercentage: 0.7,
                                                useShadowColorFromDataset: false, // optional
                                                barRadius: 12,
                                                fillShadowGradientOpacity: 1,
                                                fillShadowGradient: colors.primary,
                                                propsForBackgroundLines: {
                                                    strokeWidth: 0.1,
                                                },
                                                labelColor: () => colors.black,
                                                decimalPlaces: 0,
                                            }}
                                            fromZero
                                            showBarTops={false}
                                            showValuesOnTopOfBars={false}
                                        />
                                    </View>
                                </>
                                : null
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
        // margin: responsiveHeight(1),
        // width: '95%',
        alignItems: 'center',
        borderRadius: 7,
        paddingHorizontal: responsiveHeight(3),
        paddingVertical: responsiveHeight(5),
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    containerFooter: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        backgroundColor: colors.white,
        elevation: 5,
        overflow: 'hidden',
        borderRadius: 10,
        marginVertical: responsiveHeight(2),
        padding: 2,
    },
    box: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
        padding: 5,
        width: '70%',
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
        marginTop: responsiveHeight(5),
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 3,
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

export default DistanceReport;
