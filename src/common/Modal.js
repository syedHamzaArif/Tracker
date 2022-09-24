import React from 'react';
import { StyleSheet } from 'react-native';
import ReactNativeModal from 'react-native-modal';

function Modal(props) {
    const { visible, setVisible, loading,
        // onPress, description,
        onBackdropPress, style,
        animationIn, animationOut,
        backdropOpacity,
    } = props;

    const backHandler = () => {
        onBackdropPress ? onBackdropPress() : loading ? null : setVisible(false);
    };

    return (
        <ReactNativeModal
            propagateSwipe
            swipeDirection="down"
            onSwipeComplete={() => setVisible(false)}
            useNativeDriver={true}
            animationIn={animationIn ? animationIn : 'slideInUp'}
            animationOut={animationOut ? animationOut : 'slideOutDown'}
            // backdropColor={props.backdropColor ? props.backdropColor : theme.white}
            backdropOpacity={backdropOpacity ? backdropOpacity : 0.8}
            testID={'modal'}
            onBackButtonPress={backHandler}
            onBackdropPress={backHandler}
            isVisible={visible}
            style={{ ...styles.root, ...style }}
        >
            {props.children}
        </ReactNativeModal>
    );
}

const styles = StyleSheet.create({
    root: {
        flexGrow: 1,
        padding: 0,
        // alignItems: 'center',
        // justifyContent: 'flex-end',
        // margin: 0,
    },
});

export default Modal;
