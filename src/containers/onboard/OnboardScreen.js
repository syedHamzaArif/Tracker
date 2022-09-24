/* eslint-disable no-unused-vars */
// import Typography from 'src/components/Typography';
import images from '#assets/';
import Typography from '#common/Typography';
import { colors } from '#res/colors';
import { height, width } from '#util/';
import { responsiveHeight } from '#util/responsiveSizes';
// import { height, width } from 'src/util/index';
// import images from 'src/assets/index';
import React from 'react';
import { View, StyleSheet, TouchableHighlight, Image } from 'react-native';

const OnboardScreen = ({ data }) => {
    return (
        <TouchableHighlight underlayColor="#ffffff00" style={styles.root}>
            <>
                <View style={StyleSheet.absoluteFill}>
                    <Image source={data.image} resizeMode="contain" style={styles.imageView} />
                </View>
                <View style={styles.descriptionView}>
                    <Typography
                        variant="bold"
                        style={{
                            ...styles.descriptionText,
                            marginVertical: responsiveHeight(5),
                            fontSize: 24,
                        }}>
                        {data.title}
                    </Typography>
                    <Typography align="center" color={colors.textBody} variant="small"
                        style={{ marginBottom: responsiveHeight(6), width: width * 0.8 }}
                        size={14} >{data.desc}</Typography>
                </View>
            </>
        </TouchableHighlight>
    );
};

const styles = StyleSheet.create({
    root: {
        flexGrow: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        // backgroundColor: 'yellow',
    },
    imageView: {
        width: width * 0.75,
        height: height * 0.45,
        // backgroundColor: 'green',
        alignSelf: 'center',
        marginVertical: responsiveHeight(15),
    },
    image: {
        flex: 1,
        width: null,
        height: null,
    },
    descriptionView: {
        marginBottom: height * 0.2,
    },
    descriptionText: {
        width: width * 0.8,
        textAlign: 'center',
        // backgroundColor: 'red'
        // marginVertical: responsiveHeight(5),
    },
});

export default OnboardScreen;
