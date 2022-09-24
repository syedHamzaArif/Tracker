import React from 'react';
import LottieView from 'lottie-react-native';
import { StyleSheet } from 'react-native';
import images from '#assets/';

const ImageLoader = () => {

    return <LottieView style={StyleSheet.absoluteFill}
        source={images.imageLoading} autoPlay loop />;
};

export default ImageLoader;
