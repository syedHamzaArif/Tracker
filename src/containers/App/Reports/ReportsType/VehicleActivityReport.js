import images from '#assets/';
import LoaderView from '#common/LoaderView';
import Typography from '#common/Typography';
import { Service } from '#config/service';
import { colors } from '#res/colors';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { BarChart } from 'react-native-chart-kit';
import { timeConvert } from '#util/index';
import { TouchableOpacity } from 'react-native';
import Modal from '#common/Modal';
import ComplaintModalList from '#common/ComplaintModalList';


const VehicleActivityReport = ({ navigation }) => {

    const { userData: { AccountID } } = useSelector(state => state.userReducer);
    const [isLoading, setIsLoading] = useState(false);
    const [trackerId, setTrackerID] = useState('');
    const [speedData, setSpeedData] = useState('');
    const [idleTime, setIdleTime] = useState('');
    const [typeSelectedData, setTypeSelectedData] = useState('');
    const [typeModalVisible, setTypeModalVisible] = useState(false);
    const [trackerIDWise, setTrackerIdWise] = useState('');

    const [data, setData] = useState({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                data: [20, 45, 28, 80, 99, 43],
            },
        ],
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
                await getReportsHandler(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), new Date(), (Data[0]?.TrackerID));
                // await getSpeedReportHandler((Data[0]?.TrackerID));
                // await getAllIdleReportHandler(Data[0]?.TrackerID);
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

    const getSpeedReportHandler = async (_trackerId) => {
        const obj = {
            AccountID: AccountID,
            TrackerID: _trackerId,
        };
        setIsLoading(false);
        try {
            const { Data } = await Service.speedMilageReport(obj);
            if (Data[0].VehicleMilage === 'Not Set') {
                showAlert();
            } else {
                setSpeedData(Data[0]);
            }
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };


    const getAllIdleReportHandler = async (_id) => {
        setIsLoading(true);
        try {
            const { Data } = await Service.getAllIdleReport({ TrackerID: _id });
            setIdleTime(Data[0]);
        } catch (error) {
            console.log('Inside Catch => ', error);
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
            const { Data } = await Service.VehicleActivityReport(obj);
            setSpeedData(Data[0]);
            setIdleTime(Data[0]);
            console.log('file: VehicleActivityReport.js => line 107 => getReportsHandler => Data', Data);
            const arrayDestructed = Data[0].Data;

            if (arrayDestructed) {
                let updatedArray = [];
                let updatedDay = [];
                for (const key in arrayDestructed) {
                    const { TotalDistance, Day } = arrayDestructed[key];
                    updatedArray.push(parseInt(TotalDistance));
                    updatedDay.push(Day);
                }
                setData({
                    labels: updatedDay,
                    datasets: [{
                        data: updatedArray,
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
        await getSpeedReportHandler(_value.TrackerID);
        await getAllIdleReportHandler(_value.TrackerID);
    };


    return (
        <ScrollView contentContainerStyle={styles.root}>
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
                                        <View style={[styles.item, { width: '48%', paddingVertical: responsiveHeight(3) }]} >
                                            <Image source={images.DistanceTravelled} resizeMode="contain"
                                                style={{ width: 70, height: 70, marginBottom: 6 }} />
                                            <Typography style={{ marginTop: 10 }} variant="bold" >{speedData?.Distance ? parseFloat(speedData?.Distance).toFixed(2) : 0} km</Typography>
                                            <Typography color={colors.textSecondary} variant="semiBold" >Distance Travelled</Typography>
                                        </View>
                                        <View style={[styles.item, { width: '48%', paddingVertical: responsiveHeight(3) }]} >
                                            <Image source={images.Fuel} resizeMode="contain"
                                                style={{ width: 70, height: 70, marginBottom: 6 }} />
                                            <Typography style={{ marginTop: 10 }} variant="bold" >{parseFloat(speedData?.Milage).toFixed(2)} ltr</Typography>
                                            <Typography color={colors.textSecondary} variant="semiBold" >Fuel Consumption</Typography>
                                        </View>
                                    </View>
                                    <View style={styles.row}>
                                        <View style={[styles.item, { width: '31%', paddingVertical: responsiveHeight(2) }]} >
                                            <Image source={images.AvgSpeed} resizeMode="contain"
                                                style={{ width: 50, height: 50 }} />
                                            <Typography size={12} style={{ marginTop: 10 }} variant="bold" >{speedData?.WeeklyAvgSpeed} km/h</Typography>
                                            <Typography color={colors.textSecondary} variant="semiBold" >Avg Speed</Typography>
                                        </View>
                                        <View style={[styles.item, { width: '31%', paddingVertical: responsiveHeight(2) }]} >
                                            <Image source={images.IdleTime} resizeMode="contain"
                                                style={{ width: 50, height: 50 }} />
                                            <Typography size={12} style={{ marginTop: 10 }} variant="bold" >{timeConvert(idleTime?.IdleMins)}</Typography>
                                            <Typography color={colors.textSecondary} variant="semiBold" >Idle Time</Typography>
                                        </View>
                                        <View style={[styles.item, { width: '31%', paddingVertical: responsiveHeight(2) }]} >
                                            <Image source={images.ParkedTime} resizeMode="contain"
                                                style={{ width: 50, height: 50 }} />
                                            <Typography size={12} style={{ marginTop: 10 }} variant="bold" >{timeConvert(idleTime?.ParkedMins)}</Typography>
                                            <Typography color={colors.textSecondary} variant="semiBold" >Parking Time</Typography>
                                        </View>
                                    </View>
                                    <Typography size={18} style={{ marginVertical: 10 }} variant="bold" >Weekly Distance Graph</Typography>
                                    <View style={styles.item}>
                                        <BarChart
                                            // style={graphStyle}
                                            data={data}
                                            width={responsiveWidth(95)}
                                            height={270}
                                            yAxisSuffix=" km"
                                            chartConfig={{
                                                backgroundGradientFrom: colors.primary,
                                                backgroundGradientFromOpacity: 0,
                                                backgroundGradientTo: colors.primary,
                                                backgroundGradientToOpacity: 0,
                                                color: (opacity = 1) => colors.graphSecondary,
                                                barPercentage: 0.7,
                                                useShadowColorFromDataset: false, // optional
                                                barRadius: 4,
                                                fillShadowGradientOpacity: 1,
                                                // fillShadowGradient: colors.graphPrimary,
                                                propsForBackgroundLines: {
                                                    strokeWidth: 0.1,
                                                },
                                                labelColor: () => colors.graphPrimary,
                                                decimalPlaces: 0,
                                            }}
                                            fromZero
                                            showBarTops
                                            showValuesOnTopOfBars
                                        />
                                    </View>
                                </> : null
                        }
                    </>
            }
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    root: {
        flexGrow: 1,
        paddingHorizontal: 10,
        backgroundColor: colors.backgroundWhite,
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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

export default VehicleActivityReport;
