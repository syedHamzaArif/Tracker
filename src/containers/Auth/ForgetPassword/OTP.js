import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CodeField, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import { height, responsiveSize, width } from '#util/index';
import auth from '@react-native-firebase/auth';
import { colors } from '#res/colors';
import Typography from '#common/Typography';

const OTP = ({ navigation, route }) => {

    const confirm = route.params.confirmation;
    const phoneNumber = route.params.phoneNumber;
    const data = route.params.data;
    console.log('file: OTP.js => line 14 => OTP => data', data);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [timer, setTimer] = useState(30);
    const [value, setValue] = useState();

    const ref = useBlurOnFulfill({ value, cellCount: 6 });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    const confirmCode = async () => {
        setLoading(true);
        try {
            const result = await confirm.confirm(value);
            if (result) {
                navigation.navigate('Reset Password', { data: data });
            }
        } catch (err) {
            console.log('Invalid value.', err);
            setError('verification code is invalid..!');
            setValue('');
        } finally {
            setLoading(false);
        }
    };

    const LoginHandler = async () => {
        setLoading(true);
        try {
            navigation.navigate('Reset Password', { data: data });
        } catch (_err) {
            console.log('onSubmit -> _err', _err);
        } finally {
            setLoading(false);
        }
    };

    function onAuthStateChanged(user) {
        console.log('file: OTP.js => line 54 => onAuthStateChanged => user', user);
        if (user) {
            LoginHandler();
            auth().signOut();
        }
    }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        console.log('file: OTP.js => line 63 => useEffect => subscriber', subscriber);
        return subscriber;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    let time;
    const startTimer = () => {
        if (timer !== 0) {
            time = setTimeout(() => {
                setTimer(_timer => _timer - 1);
            }, 1000);
        } else { clearTimeout(time); }
    };

    useEffect(() => {
        startTimer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timer]);

    const resetHandler = async () => {
        try {
            const confirmation = await auth().signInWithPhoneNumber(`+${phoneNumber}`);
            if (confirmation) {
                setTimer(30);
                setValue('');
            }
            else { throw 'Something went wrong!'; }
        } catch (_err) {
            console.log('Inside Catch => ', _err);
        }
    };

    return (
        <View style={styles.root}>
            <View>
                <Typography align="center" variant="bold" size={30}>Verify Phone No.</Typography>
                <Typography align="center" style={{ marginHorizontal: 20 }}>
                    <Typography variant="medium" size={16} color={colors.textSecondary} >Check your SMS messages We've sent you the pin at </Typography>
                    <Typography variant="medium" size={16} color={colors.primary} >{phoneNumber?.split('-')[0]}</Typography>
                </Typography>
                <CodeField
                    ref={ref}
                    {...props}
                    value={value}
                    onChangeText={(_code) => {
                        setValue(_code);
                    }}
                    cellCount={6}
                    rootStyle={styles.codeFieldRoot}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    onBlur={confirmCode}
                    renderCell={({ index, symbol, isFocused }) => (
                        <Text
                            key={index}
                            style={[styles.cell, isFocused && styles.focusCell,
                            symbol ? { backgroundColor: '#eee' } : null,
                            ]}
                            onLayout={getCellOnLayoutHandler(index)}>
                            {symbol}
                        </Text>
                    )}
                />
            </View>
            {
                timer !== 0 ?
                    <Text style={{ color: colors.black, fontSize: 14, textAlign: 'center' }}>{`Didn't get the code?\n\n You will be able to resend OTP in ${timer}`}</Text>
                    :
                    <>
                        <Text style={{ color: colors.black, fontSize: 14, textAlign: 'center' }}>Didn't receive an OTP?</Text>
                        <TouchableOpacity activeOpacity={0.8} onPress={resetHandler}>
                            <Text variant="bold" style={{ fontSize: 14, marginTop: 6, textAlign: 'center', textDecorationLine: 'underline', color: colors.primary }}>Resend OTP</Text>
                        </TouchableOpacity>
                    </>
            }
            {
                error ? <Typography style={styles.error}>{error}</Typography> : null
            }
            <TouchableOpacity
                style={styles.button}
                // onPress={Next}
                activeOpacity={0.9}
                onPress={confirmCode}>
                {
                    loading ? <ActivityIndicator color={'white'} size="small" />
                        :
                        <Text style={styles.txtNext}>Verify Now</Text>
                }
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flexGrow: 1,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        padding: responsiveSize(3),
        backgroundColor: colors.background,
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        width: width * 0.6,
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
        marginTop: 20,
        // marginBottom: height * 0.1,
    },
    txtNext: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    codeFieldRoot: { marginTop: 20 },
    cell: {
        width: 40,
        height: 40,
        lineHeight: 38,
        fontSize: 24,
        borderWidth: 0.5,
        borderColor: colors.PRIMARY,
        textAlign: 'center',
        margin: 5,
        backgroundColor: 'white',
    },
    focusCell: {
        borderColor: '#000',
    },
    error: {
        fontSize: 12,
        textAlign: 'center',
        color: colors.warning,
    },
});
export default OTP;
