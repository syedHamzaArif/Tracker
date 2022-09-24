import { hitSlop } from '#util/index';
import React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';

const ImageIcon = ({ source, onPress, style, disabled, imageStyle, resizeMode }) => {
    return (
        <TouchableOpacity disabled={disabled} activeOpacity={0.7} hitSlop={hitSlop}
            onPress={onPress} style={{ ...styles.root, ...style }}>
            <Image resizeMode={resizeMode ? resizeMode : 'contain'} source={source} style={{ width: '100%', height: '100%', ...imageStyle }} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    root: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ImageIcon;
