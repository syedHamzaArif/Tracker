import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    useWindowDimensions,
    TouchableOpacity,
    Text,
} from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import OnboardScreen from './OnboardScreen';
import images from '#assets/index';
import { AuthContext } from '#context/';
import { colors } from '#res/colors';
import { width, height } from '#util/';
import { SafeAreaView } from 'react-native';
import { responsiveHeight } from '#util/responsiveSizes';

const data = [
    {
        id: 0,
        title: '24/7 Tracking',
        desc: 'Real-Time Vehicle Tracking is now made easier and smarter!',
        image: images.onboard1,
    },
    {
        id: 1,
        title: 'Safe & Secured',
        desc: 'Real time alerts and notifications',
        image: images.onboard2,
    },
    {
        id: 2,
        title: 'Service & Support',
        desc: '24x7 Call Center to assist you anytime',
        image: images.onboard3,
    },
];

const Onboard = (props) => {
    const [step, setStep] = useState(0);
    const carouselRef = useRef(null);
    const { onboard } = useContext(AuthContext);

    const _renderItem = ({ item }) => {
        return <OnboardScreen data={item} />;
    };

    const handleGetStarted = () => {
        // autoNext(true);
        onboard();
    };

    var timer;
    const autoNext = (exit) => {
        if (exit) {
            clearTimeout(timer);
            return;
        }
        timer = setTimeout(() => {
            if (step === 2) {
                onboard();
                return;
            } else {
                setStep(step + 1);
                carouselRef.current.snapToNext();
            }
        }, step === 0 ? 4000 : 3000);
    };

    useEffect(() => {
        autoNext();
        return () => {
            autoNext(true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step]);

    const Next = () => {
        console.log('Next');
        carouselRef.current.snapToNext();
    };

    return (
        <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
            <View style={styles.root}>
                {/* <View style={{backgroundColor: 'red', zIndex: 1}}> */}
                <TouchableOpacity
                    hitSlop={{ left: 50, right: 50, top: 50, bottom: 50 }}
                    style={styles.skipbutton}
                    onPress={handleGetStarted}
                    activeOpacity={0.9}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
                {/* </View> */}
                <View style={styles.onBoardView}>
                    <Carousel
                        ref={carouselRef}
                        scrollToOverflowEnabled
                        data={data}
                        renderItem={_renderItem}
                        // scrollEnabled={false}
                        onSnapToItem={(index) => setStep(index)}
                        sliderWidth={useWindowDimensions().width}
                        itemWidth={useWindowDimensions().width}
                    />
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={step === 2 ? handleGetStarted : Next}
                        activeOpacity={0.9}>
                        <Text style={styles.txtNext}>{step === 2 ? 'Get Started' : 'Next'}</Text>
                    </TouchableOpacity>
                    <Pagination
                        dotsLength={data.length}
                        activeDotIndex={step}
                        dotColor={colors.primary}
                        inactiveDotColor={'white'}
                        inactiveDotOpacity={1000}
                        dotContainerStyle={{ marginHorizontal: 1 }}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    root: {
        flexGrow: 1,
        backgroundColor: colors.white,
    },
    onBoardView: {
        ...StyleSheet.absoluteFill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionImage: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '30%',
        opacity: 0.3,
    },
    logo2: {
        width: 100,
        height: 150,
    },
    bottomContainer: {
        width: '100%',
        paddingBottom: 12,
        alignItems: 'center',
        marginTop: height * 0.78,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 8,
        backgroundColor: colors.primary,
    },
    inactiveDot: {
        width: 18,
        height: 18,
        borderRadius: 8,
        opacity: 1,
        backgroundColor: colors.textSecondary,
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        width: width * 0.8,
        height: height * 0.065,
        margin: 5,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
        borderRadius: 8,
        flexDirection: 'row',
        // backgroundColor: colors.primary,
        backgroundColor: colors.primary,
        // marginBottom: height * 0.1,
    },
    txtNext: {
        color: 'white',
        fontWeight: 'bold',
    },
    skipbutton: {
        alignItems: 'center',
        alignSelf: 'flex-end',
        width: width * 0.2,
        marginTop: responsiveHeight(2),
        marginRight: responsiveHeight(2),
        padding: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
        borderRadius: 6,
        // backgroundColor: colors.primary,
        backgroundColor: colors.primary,
        zIndex: 1,
    },
    skipText: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: colors.white,
    },
});

export default Onboard;
