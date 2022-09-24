import { colors } from '#res/colors';
import { getFonts } from '#util/';
import { responsiveFontSize } from '#util/responsiveSizes';
import React from 'react';
import { Text } from 'react-native';

function Typography(props) {
    const { variant, size, lineHeight, color, align, style, numberOfLines } = props;
    const fonts = getFonts();
    let updatedStyles = {};
    if (Array.isArray(style)) {
        for (const index in style) {
            const element = style[index];
            updatedStyles = { ...updatedStyles, ...element };
        }
    } else {
        updatedStyles = style;
    }
    return (
        <Text
            style={{
                fontFamily: variant === 'regular' ? fonts.regular
                    : variant === 'small' ? fonts.light
                        : variant === 'medium' ? fonts.medium
                            : variant === 'bold' ? fonts.bold
                                : variant === 'semiBold' ? fonts.semiBold
                                    : variant === 'black' ? fonts.black
                                        : fonts.regular,
                fontSize:
                    size ? size :
                        variant === 'small' ? responsiveFontSize(1.6)
                            : variant === 'medium' ? responsiveFontSize(1.6)
                                : variant === 'regular' ? responsiveFontSize(1.8)
                                    : variant === 'semiBold' ? responsiveFontSize(1.9)
                                        : variant === 'bold' ? responsiveFontSize(2)
                                            : variant === 'black' ? responsiveFontSize(2.2) : responsiveFontSize(1.8),
                color: color ? color : colors.textPrimary,
                textAlign: align ? align : 'left',
                lineHeight: lineHeight && lineHeight,
                ...updatedStyles,
            }}
            numberOfLines={numberOfLines}
        >
            {props.children}
        </Text>

    );
}

export default Typography;
