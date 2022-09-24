import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Keyboard,
} from 'react-native';
import InputComponent from '#common/Input';
import Typography from '#common/Typography';
import Button from '#common/Button';
import { colors } from '#res/colors';
import { AuthContext } from '#context/';
import images from '#assets/';
import { responsiveHeight } from '#util/responsiveSizes';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Login = ({ navigation }) => {

    const { signIn } = useContext(AuthContext);
    const userNameRef = useRef(null);
    const passwordRef = useRef(null);

    const [loginForm, updateLoginForm] = useState({
        username: {
            elementType: 'input',
            elementConfig: {
                name: 'username',
                placeholder: 'Username',
                autoCapitalize: 'none',
                blurOnSubmit: false,
            },
            value: '',
            visible: true,
            validation: {
                required: true,
            },
            errorMessage: 'Please enter a valid username',
            valid: true,
            ref: userNameRef,
        },
        password: {
            elementType: 'input',
            elementConfig: {
                name: 'password',
                placeholder: 'Password',
                blurOnSubmit: true,
            },
            value: '',
            visible: true,
            validation: {
                required: true,
            },
            valid: false,
            errorMessage: 'Please enter a valid password',
            ref: passwordRef,
        },
    });


    const [formIsValid, setFormIsValid] = useState(false);
    const [loading, setLoading] = useState(false);
    const [responseError, setResponseError] = useState('');
    const [showError, setShowError] = useState(false);
    const [keyboardUp, setKeyboardUp] = useState(false);

    const handleLogin = async () => {
        Keyboard.dismiss();
        if (formIsValid) {
            setLoading(true);
            const updatedData = {
                username: loginForm.username.value,
                Password: loginForm.password.value,
            };
            try {
                let data = { ...updatedData, grant_type: 'password' };
                await signIn(data);
            } catch (error) {
                if (error === 'invalid_grant') {
                    setResponseError('Invalid username or password');
                } else {
                    setResponseError(error);
                }
                console.log('Inside Catch => ', error);
            }
            finally {
                setLoading(false);
            }
        } else {
            setShowError(true);
            setLoading(false);
            // setResponseError('Invalid username or password');
        }
    };

    const emailRE = new RegExp(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}/g);

    const checkValidity = (value, validation) => {
        let isValid = true;
        if (validation.required) {
            isValid = value.trim() !== '' && isValid;
        }
        if (validation.lowerCase) {
            value = value.toLowerCase();
            isValid = isNaN(value) && isValid;
        }
        if (validation.email) {
            isValid = emailRE.test(value) && isValid;
        }
        return isValid;
    };

    const inputChangeHandler = (inputID, value) => {
        if (showError) setShowError(false);
        if (responseError) setResponseError('');
        const updatedForm = { ...loginForm };
        const updatedFormElement = {
            ...updatedForm[inputID],
        };
        updatedFormElement.value = value;
        updatedFormElement.valid = checkValidity(updatedFormElement.value, updatedFormElement.validation);
        // updatedFormElement.touched = true;
        if (updatedFormElement.valid) updatedFormElement.showError = false;
        else updatedFormElement.showError = true;
        updatedForm[inputID] = updatedFormElement;

        let updatedFormIsValid = true;
        for (let inputIdentifer in updatedForm) {
            updatedFormIsValid = updatedForm[inputIdentifer].valid && updatedFormIsValid;
        }
        updateLoginForm(updatedForm);
        setFormIsValid(updatedFormIsValid);
    };

    const forgotPressHandler = () => {
        navigation.navigate('ForgotPassword');
    };



    const onSubmitHandler = (_type) => {
        if (_type === 'password') {
            return handleLogin();
        }
        loginForm.password.ref.current.focus();
    };



    useEffect(() => {
        const _keyboardUp = Keyboard.addListener('keyboardDidShow', () => setKeyboardUp(true));
        const keyboardDown = Keyboard.addListener('keyboardDidHide', () => setKeyboardUp(false));

        return () => {
            _keyboardUp.remove();
            keyboardDown.remove();
        };
    }, []);

    const formElementsArray = [];
    for (let key in loginForm) {
        formElementsArray.push({
            id: key,
            config: loginForm[key],
        });
    }
    let form = (
        formElementsArray.map(element => (
            <InputComponent
                inputStyle={{ padding: 3, paddingLeft: 10 }}
                key={element.id}
                elementType={element.config.elementType}
                elementConfig={element.config.elementConfig}
                leftIcon={element.config.leftIcon}
                value={element.config.value}
                shouldValidate={element.config.validation}
                visible={element.config.visible}
                change={inputChangeHandler.bind(this, element.id)}
                errorMessage={element.config.errorMessage}
                isValid={element.config.valid}
                showError={showError}
                ref={element.config.ref}
                onSubmitHandler={onSubmitHandler}
                returnKeyType
            />
        ))
    );


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{
                ...styles.screen,
                marginBottom: useSafeAreaInsets().bottom + 10,
                // justifyContent: keyboardUp ? 'space-evenly' : 'space-between',

            }}>
            <View style={styles.header}>
                {
                    !keyboardUp ?
                        <Image
                            source={images.logo}
                            style={{ width: 100, height: 100, marginBottom: responsiveHeight(6) }}
                            resizeMode="stretch"
                        /> : null
                }
                <Typography size={30} variant="bold">Sign In</Typography>
                <Typography color={colors.textBody} size={16} variant="small">Enter your credentials to get started</Typography>
            </View>
            <View>
                {form}
                {responseError ? (
                    <Typography style={{ color: colors.warning, paddingTop: 10, alignSelf: 'center' }}>
                        {responseError}
                    </Typography>
                ) : null}
            </View>
            <View>
                <TouchableOpacity activeOpacity={0.7} style={{ marginVertical: responsiveHeight(1) }}
                    onPress={forgotPressHandler}
                >
                    <Typography align="center" color={colors.primary} size={16} variant="medium">Forgot Password?</Typography>
                </TouchableOpacity>
                <Button style={{ marginBottom: responsiveHeight(1) }}
                    loading={loading} onPress={handleLogin} title="LOG IN" />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flexGrow: 1,
        paddingHorizontal: 15,
        paddingVertical: 50,
        backgroundColor: colors.background,
    },
    input: {
        flex: 3,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 25,
    },
    header: {
        alignItems: 'center',
        // marginVertical: 10,
    },
});
export default Login;
