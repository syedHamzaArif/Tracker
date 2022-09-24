import Button from '#common/Button';
import Typography from '#common/Typography';
import { Service } from '#config/service';
import { AuthContext } from '#context/';
import { colors } from '#res/colors';
import { width } from '#util/';
import { getValue } from '#util/';
import { responsiveSize } from '#util/';
import { responsiveHeight } from '#util/responsiveSizes';
import React, { useContext, useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { View, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { Icon, Input } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ChangePassword = ({ navigation }) => {

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isKeyboardUp, setIsKeyboardUp] = useState(false);
    const { showFlashMessage } = useContext(AuthContext);

    const [states, setStates] = useState({
        OldPassword: {
            show: false,
            value: '',
            visible: true,
            validation: {
                required: true,
                minLength: 6,
            },
            valid: false,
            showError: true,
            errorMessage: 'Password must contain atleast 6 letters',
        },
        NewPassword: {
            show: false,
            value: '',
            visible: true,
            validation: {
                required: true,
                minLength: 6,
            },
            valid: false,
            showError: true,
            errorMessage: 'Password must contain atleast 6 letters',
        },
        ConfirmPassword: {
            show: false,
            value: '',
            visible: true,
            validation: {
                required: true,
                minLength: 6,
            },
            valid: false,
            showError: true,
            errorMessage: 'Password must contain atleast 6 letters',
        },
    });

    useEffect(() => {
        const _keyboardUp = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardUp(true));
        const keyboardDown = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardUp(false));

        return () => {
            _keyboardUp.remove();
            keyboardDown.remove();
        };
    }, []);

    const changeHandler = (key, value) => {
        const updated = { ...states, [key]: { ...states[key], value } };
        setStates(updated);
        setError('');
    };

    const showHandler = (key, value) => {
        const updated = { ...states, [key]: { ...states[key], show: value } };
        setStates(updated);
    };

    const submitHandler = async () => {
        if (states.OldPassword.value === '') {
            setError('Required All fields');
            return;
        }
        else if (states.NewPassword.value !== states.ConfirmPassword.value) {
            setError('Password do not match');
            return;
        }
        else if (states.NewPassword.value === states.OldPassword.value) {
            setError('New password & old password cannot be same');
            return;
        }
        else {
            setLoading(true);
            const updatedData = {
                OldPassword: states.OldPassword.value,
                NewPassword: states.NewPassword.value,
                ConfirmPassword: states.ConfirmPassword.value,
            };
            try {
                const { Data } = await Service.changePassword(updatedData);
                if (Data === 'Password Changed Successfully!') {
                    showFlashMessage({
                        message: 'Change Password',
                        type: 'info',
                        duration: 1800,
                        position: 'top',
                        description: 'your password has been changed',
                        titleStyle: { fontSize: 18 },
                        textStyle: { fontSize: 12 },
                        backgroundColor: colors.primary,
                        color: colors.white,
                        hideOnPress: true,
                        floating: true,
                    });
                    navigation.goBack();
                } else {
                    setError(Data);
                }
            } catch (err) {
                setError(err);
                console.log('Inside Catch => ', err);
            } finally {
                setLoading(false);
            }
        }
    };


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ ...styles.root, justifyContent: isKeyboardUp ? 'flex-start' : 'space-evenly', marginTop: useSafeAreaInsets().top }}>
            <Typography variant="bold" size={24}>Change your password</Typography>
            <View>
                {
                    Object.entries(states).map(([key, value]) => (
                        <Input
                            key={key}
                            placeholder={getValue(key)}
                            inputContainerStyle={{
                                width: '100%',
                                borderBottomWidth: 0,
                            }}
                            style={styles.inputStyle}
                            containerStyle={styles.input}
                            autoCapitalize="none"
                            onChangeText={changeHandler.bind(this, key)}
                            value={value.value}
                            textContentType="password"
                            secureTextEntry={!value.show}
                            rightIcon={
                                // key !== 'ConfirmPassword' ?
                                <Icon
                                    underlayColor="transparent"
                                    name={!value.show ? 'lock' : 'unlock-alt'}
                                    type="font-awesome"
                                    iconStyle={{ marginRight: 10 }}
                                    hitSlop={{ left: 20, right: 20, top: 20, bottom: 20 }}
                                    onPress={showHandler.bind(this, key, !value.show)}
                                />
                                // : null
                            }

                        />
                    ))
                }
            </View>
            {
                error ? <Typography style={styles.error}>{error}</Typography> : null
            }
            <Button style={{ width: '90%' }} title="Done" loading={loading} onPress={submitHandler} />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    root: {
        flexGrow: 1,
        // justifyContent: 'space-evenly',
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


export default ChangePassword;
