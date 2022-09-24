import { colors } from '#res/colors';
import { height } from '#util/';
import { responsiveFontSize } from '#util/responsiveSizes';
import React from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Typography from './Typography';



const Button = ({ title = 'Button', icon, onPress, variant, style, loading, disabled, textStyle, opacity }) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={opacity ? opacity : 0.9}
            style={[
                styles.button,
                style,
            ]}
            disabled={loading || disabled}>
            {loading ?
                <ActivityIndicator
                    color={colors.white}
                    size={24} />
                :
                <Typography variant={variant ? variant : 'bold'}
                    style={{
                        color: colors.white,
                        fontSize: responsiveFontSize(2),
                        fontWeight: 'bold',
                        ...textStyle,
                    }}
                >
                    {title}
                </Typography>
            }
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        // width: width * 0.9,
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
        backgroundColor: colors.primary,

    },
});

export default Button;
