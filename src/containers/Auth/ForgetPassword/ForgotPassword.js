
import Button from '#common/Button';
import Typography from '#common/Typography';
import { colors } from '#res/colors';
import { width } from '#util/';
import { responsiveSize } from '#util/';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon, Input } from 'react-native-elements';
import auth from '@react-native-firebase/auth';
import { hitSlop } from '#util/';
import { responsiveWidth } from '#util/responsiveSizes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { KeyboardAvoidingView } from 'react-native';
import { Service } from '#config/service';

const ForgotPassword = ({ navigation }) => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [username, setUsername] = useState('');

    const submitHandler = async (_data) => {
        setLoading(true);

        let str = 0;
        let digit = ('' + _data.Phone)[0];
        if (digit === '0') {
            str = _data.Phone.substring(1);
            str = `+92${str}`;
        } else {
            str = _data.Phone;
        }
        let temp = ('' + str)[0];
        if (temp === '+') {
            try {
                console.log('file: ForgotPassword.js => line 39 => submitHandler => str?.split(' - ')[0]', str?.split('-')[0]);
                const confirmation = await auth().signInWithPhoneNumber(str?.split('-')[0]);
                navigation.navigate('OTP', { phoneNumber: str, data: _data, confirmation });
            } catch (_err) {
                console.log('file: ForgotPassword.js => line 42 => submitHandler => _err', _err);
                setError('The format of the phone number provided is incorrect..!');
            } finally {
                setLoading(false);
            }
        } else {
            setError('Wrong Number');
        }
        setLoading(false);
    };

    const verifyUserNameHandler = async () => {
        setLoading(true);
        try {
            const { Data } = await Service.forgetPassword(username);
            if (Data === 'User Not Found') {
                setError(Data);
            }
            else if (Data[0]) {
                await submitHandler(Data[0]);
            }
            else {
                setError('Something Went Number');
            }
        } catch (_err) {
            console.log('Inside Catch => ', _err);
            setError(_err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ ...styles.root, marginTop: useSafeAreaInsets().top }}>
            <View style={{ position: 'absolute', left: 0, top: 0 }}>
                <Icon name="chevron-left" type="font-awesome-5" underlayColor="transparent"
                    color={colors.textPrimary} hitSlop={hitSlop}
                    size={24}
                    containerStyle={{ padding: 8, marginLeft: responsiveWidth(2) }}
                    onPress={navigation.goBack}
                />
            </View>
            <View>
                <Typography align="center" variant="bold" size={30}>Forgot Password</Typography>
                <Typography align="center" style={{ marginHorizontal: 20 }} variant="medium" size={16} color={colors.textSecondary} >
                    Enter your user name to get password reset PIN codes
                </Typography>
            </View>
            <View>
                <Input
                    inputContainerStyle={{
                        width: '100%',
                        borderBottomWidth: 0,
                    }}
                    style={styles.inputStyle}
                    containerStyle={styles.input}
                    autoCapitalize="none"
                    onChangeText={(_text) => {
                        setUsername(_text);
                        setError(false);
                    }}
                    value={username}
                    placeholder={'User Name'}
                />
                {
                    error ? <Typography style={styles.error}>{error}</Typography> : null
                }
            </View>
            <Button style={{ width: '90%' }} title="Done" loading={loading} onPress={verifyUserNameHandler} />
        </KeyboardAvoidingView>
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
    input: {
        paddingHorizontal: 12,
        height: 50,
        borderWidth: 1,
        backgroundColor: '#eee',
        borderRadius: 12,
        marginVertical: 8,
        borderColor: '#eee',
        padding: 3,
        width: width * 0.9,
    },
    inputStyle: {
        fontSize: 14,
        textAlign: 'center',
    },
    error: {
        fontSize: 12,
        textAlign: 'center',
        color: colors.warning,
    },
});

export default ForgotPassword;
