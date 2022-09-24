import Button from '#common/Button';
import Typography from '#common/Typography';
import { colors } from '#res/colors';
import { height } from '#util/';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';

const NoInternet = ({ internetConnectionHandler, cancelHandler, title }) => {

    return (
        <View style={styles.root}>
            <Icon name="cross" type="entypo"
                size={30} color={colors.primary}
                onPress={cancelHandler}
                containerStyle={styles.crossIcon} />
            <View style={styles.child}>
                <Typography variant="bold">{title}</Typography>
                <Typography variant="regular">Check your network connection and try again</Typography>
            </View>
            <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
                <Button opacity={0.5} style={{ width: '60%', height: height * 0.055 }} title="Retry"
                    onPress={internetConnectionHandler} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flexGrow: 1,
        backgroundColor: colors.backgroundWhite,
        // justifyContent: 'center',
        // alignItems: 'center',
        marginVertical: 100,
        borderRadius: 5,
    },
    child: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: colors.backgroundWhite,
    },
    crossIcon: {
        position: 'absolute',
        zIndex: 2,
        right: 0,
        top: 0,
        paddingRight: responsiveWidth(0),
        paddingTop: responsiveHeight(0),
    },
});

export default NoInternet;
