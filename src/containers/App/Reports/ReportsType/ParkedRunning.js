import images from '#assets/';
import LoaderView from '#common/LoaderView';
import Typography from '#common/Typography';
import { Service } from '#config/service';
import { colors } from '#res/colors';
import { timeConvert } from '#util/';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { PieChart } from 'react-native-svg-charts';
import { TouchableOpacity } from 'react-native';
import Modal from '#common/Modal';
import ComplaintModalList from '#common/ComplaintModalList';

const chartConfig = {
    backgroundGradientFrom: colors.primary,
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: colors.secondary,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
};

const ParkedRunning = (props) => {

    const { userData: { AccountID } } = useSelector(state => state.userReducer);
    const [isLoading, setIsLoading] = useState(false);
    const [idleTime, setIdleTime] = useState('');
    const [typeSelectedData, setTypeSelectedData] = useState('');
    const [typeModalVisible, setTypeModalVisible] = useState(false);
    const [trackerIDWise, setTrackerIdWise] = useState('');

    const [data, setData] = useState([
        { value: 50, color: colors.primary },
        { value: 10, color: colors.graphPrimary },
        { value: 40, color: colors.green },
    ]);

    const pieData = data
        .filter((value) => value.value > 0)
        .map((item, index) => ({
            value: item.value,
            svg: {
                fill: item.color,
                onPress: () => console.log('press', index),
            },
            key: `pie-${index}`,
        }));

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
            if (Data.length === 1) {
                await getAllIdleReportHandler(Data[0]?.TrackerID);
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

    const getAllIdleReportHandler = async (_id) => {
        setIsLoading(true);
        try {
            const { Data } = await Service.getParkedRunningIdle({ TrackerID: _id });
            setIdleTime(Data[0]);
            const temp = [Data[0].RunningMins, Data[0].IdleMins, Data[0].ParkedMins];

            const updatedData = [...data];
            for (const key in updatedData) {
                const element = { ...updatedData[key] };
                element.value = +temp[key];
                updatedData[key] = element;
            }
            console.log('file: ParkedRunning.js => line 107 => getAllIdleReportHandler => updatedData', updatedData);
            setData(updatedData);
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const newsPressHandler = async (_value) => {
        setTypeSelectedData(_value);
        setTypeModalVisible(false);
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
                            idleTime ? <>

                                <View style={styles.row}>
                                    <View style={[styles.item, { width: '48%', paddingVertical: responsiveHeight(3.5) }]} >
                                        <Image source={images.IdleTime} resizeMode="contain"
                                            style={{ width: 70, height: 70, marginBottom: 6 }} />
                                        <Typography style={{ marginTop: 10 }} variant="bold" >{timeConvert(idleTime?.IdleMins)}</Typography>
                                        <Typography color={colors.textSecondary} variant="regular" >Idle Minutes</Typography>
                                    </View>
                                    <View style={[styles.item, { width: '48%', paddingVertical: responsiveHeight(3.5) }]} >
                                        <Image source={images.ParkedTime} resizeMode="contain"
                                            style={{ width: 70, height: 70, marginBottom: 6 }} />
                                        <Typography style={{ marginTop: 10 }} variant="bold" >{timeConvert(idleTime?.ParkedMins)}</Typography>
                                        <Typography color={colors.textSecondary} variant="regular" >Parking Minutes</Typography>
                                    </View>
                                </View>
                                <View style={styles.row}>
                                    <View style={[styles.item, { width: '100%', paddingVertical: responsiveHeight(2) }]} >
                                        <Image source={images.AvgSpeed} resizeMode="contain"
                                            style={{ width: 50, height: 50 }} />
                                        <Typography size={14} style={{ marginTop: 10 }} variant="bold" >{timeConvert(idleTime?.RunningMins)}</Typography>
                                        <Typography color={colors.textSecondary} variant="regular" >Running Minutes</Typography>
                                    </View>
                                </View>
                                <PieChart
                                    style={{ height: 200, marginTop: responsiveHeight(6) }}
                                    data={pieData}
                                    innerRadius="75%"
                                />
                                <View style={[styles.row, { flexWrap: 'wrap', marginTop: responsiveHeight(2), marginHorizontal: 7 }]}>
                                    <View style={styles.dot} />
                                    <Typography>Running Mins</Typography>
                                    <View style={[styles.dot, { backgroundColor: colors.graphPrimary }]} />
                                    <Typography>Idle Mins</Typography>
                                    <View style={[styles.dot, { backgroundColor: colors.green }]} />
                                    <Typography>Parked Mins</Typography>
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
        padding: 10,
        backgroundColor: colors.background,
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
        // paddingVertical: responsiveHeight(4),
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dot: {
        borderColor: colors.primary,
        borderRadius: 20,
        backgroundColor: colors.primary,
        width: 8,
        height: 8,
        marginHorizontal: 10,
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

export default ParkedRunning;
