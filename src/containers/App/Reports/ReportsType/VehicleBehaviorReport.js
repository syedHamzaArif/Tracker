import Typography from '#common/Typography';
import { colors } from '#res/colors';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';
import images from '#assets/';
import { StackedBarChart } from 'react-native-chart-kit';
import { useSelector } from 'react-redux';

const VehicleBehaviorReport = () => {

    const data = {
        labels: ['Mon', 'Tues'],
        legend: ['Braking', 'Acceleration', 'Battery'],
        data: [
            [60, 60, 60],
            [30, 30, 60],
        ],
        barColors: ['#9cf2ff', '#64e7fa', '#24e4ff'],
    };

    const { userData: { UserName } } = useSelector(state => state.userReducer);

    const chartConfig = {
        backgroundGradientFrom: '#1E2923',
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: '#08130D',
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => `rgba(0, 180, 200, ${opacity})`, // optional
        strokeWidth: 2, // optional, default 3
        barPercentage: 1,
    };

    const fadeAnim = useRef(new Animated.Value(0)).current;  // Initial value for opacity: 0


    useEffect(() => {
        Animated.timing(
            fadeAnim,
            {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            }
        ).start();
    }, [fadeAnim]);

    return (
        <View style={styles.root}>
            <View style={styles.headerBackground} />
            <View style={styles.footerBackground} />
            <Typography style={styles.headingText} color={colors.white} size={30} variant="bold">Hi {UserName},</Typography>
            <View style={styles.card}>
                <View style={styles.row}>
                    <Image source={images.reports5} resizeMode="contain"
                        style={{ width: 35, height: 35 }} />
                    <Typography style={{ marginHorizontal: 30 }} variant="bold">Hard Braking</Typography>
                </View>
                <View style={styles.row}>
                    <Image source={images.speed} resizeMode="contain"
                        style={{ width: 35, height: 35 }} />
                    <Typography style={{ marginHorizontal: 30 }} variant="bold">Hard Acceleration</Typography>
                </View>
                <View style={styles.row}>
                    <Image source={images.battery} resizeMode="contain"
                        style={{ width: 35, height: 35 }} />
                    <Typography style={{ marginHorizontal: 30 }} variant="bold">Low Battery</Typography>
                </View>
                <Animated.View style={{
                    // Bind opacity to animated value
                    opacity: fadeAnim,
                }}>
                    <StackedBarChart
                        style={styles.graphStyle}
                        data={data}
                        width={responsiveWidth(80)}
                        height={responsiveHeight(35)}
                        yAxisLabel="$"
                        chartConfig={chartConfig}
                        verticalLabelRotation={8}
                    />
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    headerBackground: {
        backgroundColor: colors.primary,
        flex: 5,
    },
    footerBackground: {
        backgroundColor: colors.white,
        flex: 5,
    },
    card: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor: 'white',
        zIndex: 2,
        position: 'absolute',
        left: responsiveWidth(10),
        right: responsiveWidth(10),
        width: '82%',
        top: responsiveHeight(20),
        borderRadius: 7,
        paddingVertical: 5,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 30,
        paddingVertical: 10,
    },
    graphStyle: {
        marginTop: 20,
        backgroundColor: colors.background,
    },
    headingText: {
        marginHorizontal: 20,
        zIndex: 2,
        position: 'absolute',
        top: responsiveHeight(5),
    },
});

export default VehicleBehaviorReport;
