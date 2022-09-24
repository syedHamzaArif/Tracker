import React, { } from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import images from '#assets/';

const LoaderView = () => {
    return (
        <View style={{ flex: 1, padding: 50 }}>
            <View style={{ flex: 1 }}>
                <LottieView
                    style={{ flex: 1 }}
                    source={images.loader} autoPlay loop />
            </View>
        </View>
    );
};


export default LoaderView;
