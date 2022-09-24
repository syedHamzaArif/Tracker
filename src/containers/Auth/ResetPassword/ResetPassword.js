import Button from '#common/Button';
import Typography from '#common/Typography';
import { Service } from '#config/service';
import { AuthContext } from '#context/';
import { colors } from '#res/colors';
import { width } from '#util/';
import { getValue } from '#util/';
import { responsiveSize } from '#util/';
import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, BackHandler, KeyboardAvoidingView, Platform } from 'react-native';
import { Icon, Input } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


let succesMsgDetails = {
    message: 'Update Password',
    type: 'info',
    duration: 2400,
    position: 'top',
    description: 'User Password Changed Successfully',
    titleStyle: { fontSize: 18 },
    textStyle: { fontSize: 12 },
    backgroundColor: colors.primary,
    color: 'white',
    hideOnPress: true,
    floating: true,
};

const ResetPassword = ({ navigation, route }) => {
    const data = route.params.data;
    console.log('file: ResetPassword.js => line 30 => ResetPassword => data', data);

    // const { userData } = useSelector(state => state.userReducer);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { showFlashMessage } = useContext(AuthContext);

    const [states, setStates] = useState({
        Password: {
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
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => {
            backHandler.remove();
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
        console.log('file: ResetPassword.js => line 83 => submitHandler => states.NewPassword.value', states.Password.value);
        if (states.Password.value === '' && states.ConfirmPassword.value === '') {
            setError('Required All fields');
            return;
        }
        else if (states.Password.value !== states.ConfirmPassword.value) {
            setError('Password do not match');
            return;
        }
        else {
            setLoading(true);
            const obj = {
                UserName: data.UserName,
                NewPassword: states.Password.value,
                ConfirmPassword: states.ConfirmPassword.value,
                Token: data.PasswordResetToken,
            };

            try {
                const { Data, Message } = await Service.ResetPassword(obj);
                console.log('file: ResetPassword.js => line 100 => submitHandler => Data', Data);
                if (Data === 'Password Reset Successfully!') {
                    navigation.navigate('Login');
                } else {
                    setError(Message);
                }
            } catch (err) {
                console.log('Inside Catch => ', err);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ ...styles.root, marginTop: useSafeAreaInsets().top }}>
            <Typography variant="bold" size={24}>Password Reset</Typography>
            <View>
                {
                    Object.entries(states).map(([key, value]) => (
                        <View key={key} >
                            <Typography>{getValue(key)}</Typography>
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
                        </View>
                    ))
                }
            </View>
            {
                error ? <Typography style={styles.error
                } > {error}</Typography> : null
            }
            <Button style={{ width: '90%' }} title="Done" loading={loading} onPress={submitHandler} />
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

export default ResetPassword;
