import { useEffect, useRef, useState } from 'react';
import { Dimensions } from 'react-native';

const useDimensionsListener = () => {
    const [screenDimension, setScreenDimension] = useState(
        Dimensions.get('screen')
    );
    const [windowDimension, setWindowDimension] = useState(
        Dimensions.get('window')
    );

    useEffect(() => {
        function handleDimensionChange({
            window,
            screen,
        }) {
            setWindowDimension(window);
            setScreenDimension(screen);
        }

        Dimensions.addEventListener('change', handleDimensionChange);
        return () => {
            Dimensions.removeEventListener('change', handleDimensionChange);
        };
    }, []);

    return {
        screen: screenDimension,
        window: windowDimension,
    };
};

const percentageCalculation = (max, val) => max * (val / 100);

const fontCalculation = (height, width, val) => {
    const widthDimension = height > width ? width : height;
    const aspectRatioBasedHeight = (16 / 9) * widthDimension;
    return percentageCalculation(
        Math.sqrt(
            Math.pow(aspectRatioBasedHeight, 2) + Math.pow(widthDimension, 2)
        ),
        val
    );
};

export const useDimensionsChange = (effect) => {
    const hasMountRef = useRef(false);
    const dimensions = useDimensionsListener();

    useEffect(() => {
        if (hasMountRef.current) {
            const destroy = effect(dimensions);
            let cleanUp = () => null;
            if (typeof destroy === 'function') {
                cleanUp = destroy;
            }
            return () => cleanUp();
        } else {
            hasMountRef.current = true;
        }
    }, [dimensions, effect]);
};

export const responsiveHeight = (h) => {
    const { height } = Dimensions.get('window');
    return percentageCalculation(height, h);
};

export const responsiveWidth = (w) => {
    const { width } = Dimensions.get('window');
    return percentageCalculation(width, w);
};

export const responsiveFontSize = (f) => {
    const { height, width } = Dimensions.get('window');
    return fontCalculation(height, width, f);
};

export const responsiveScreenHeight = (h) => {
    const { height } = Dimensions.get('screen');
    return percentageCalculation(height, h);
};

export const responsiveScreenWidth = (w) => {
    const { width } = Dimensions.get('screen');
    return percentageCalculation(width, w);
};

export const responsiveScreenFontSize = (f) => {
    const { height, width } = Dimensions.get('screen');
    return fontCalculation(height, width, f);
};

export const useResponsiveHeight = (h) => {
    const { height } = useDimensionsListener().window;
    return percentageCalculation(height, h);
};

export const useResponsiveWidth = (w) => {
    const { width } = useDimensionsListener().window;
    return percentageCalculation(width, w);
};

export const useResponsiveFontSize = (f) => {
    const { height, width } = useDimensionsListener().window;
    return fontCalculation(height, width, f);
};

export const useResponsiveScreenHeight = (h) => {
    const { height } = useDimensionsListener().screen;
    return percentageCalculation(height, h);
};

export const useResponsiveScreenWidth = (w) => {
    const { width } = useDimensionsListener().screen;
    return percentageCalculation(width, w);
};

export const useResponsiveScreenFontSize = (f) => {
    const { height, width } = useDimensionsListener().screen;
    return fontCalculation(height, width, f);
};
