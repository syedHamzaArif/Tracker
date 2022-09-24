import React, { useEffect, useMemo, useRef, useState } from 'react';
import SplashScreen from 'react-native-splash-screen';
import { AuthContext } from '#context/index';
import { CommonActions, NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage';
import { Service } from '#config/service';
import { } from '#assets/index';
import Geocoder from 'react-native-geocoding';
import { useDispatch, useSelector } from 'react-redux';
import { updatedata, clearuserdata } from '#redux/actions/actionCreators';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import RootStackScreen from './RootStack/RootStack';
import NetInfo from '@react-native-community/netinfo';
import Modal from '#common/Modal';
import NoInternet from './NoInternet';
import LogoutComponent from './LogoutComponent';
import SessionExpired from './SessionExpired';
import messaging from '@react-native-firebase/messaging';
import { colors } from '#res/colors';
import * as Sentry from '@sentry/react-native';
import Sound from 'react-native-sound';

// const sound = new Sound(require('../assets/sound/carstart.wav'), error => {
//     if (error) {
//         console.log('failed to load the sound', error);
//     }
// });

const sound = {
    ignition_on: new Sound(require('../assets/sound/ignitionon.wav'), error => {
        if (error) {
            console.log('failed to load the sound', error);
        }
    }),
    ignition_off: new Sound(require('../assets/sound/ignitionoff.wav'), error => {
        if (error) {
            console.log('failed to load the sound', error);
        }
    }),
};

const AppNavigation = ({ }) => {
    const [userToken, setUserToken] = useState('');
    const [onboarding, setOnboarding] = useState('');
    const [firebaseToken, setFirebaseToken] = useState('');
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [sessionExpiredModalVisible, setSessionExpiredModalVisible] = useState(false);
    const [noNetworkModalVisible, setNoNetworkModalVisible] = useState(false);

    const dispatch = useDispatch();
    const updateUserData = (data) => dispatch(updatedata(data));
    const clearData = () => dispatch(clearuserdata());
    const { notificationCount } = useSelector(state => state.userReducer);
    const { userData } = useSelector(state => state.userReducer);
    const navigationRef = useRef(null);
    const flashMessageRef = useRef(null);


    const authContext = useMemo(() => {
        return {
            onboard: () => {
                setOnboarding('true');
                AsyncStorage.setItem('@onboarding', 'true');
            },
            signIn: async (data) => {
                try {
                    const obj = { ...data, FCMToken: firebaseToken };
                    const result = await Service.login(obj);
                    if (!result.AccountID) {
                        const error = 'Invalid username or password';
                        throw error;
                    }
                    await authContext.verifyToken(result.access_token);
                    return result;
                } catch (error) {
                    throw error;
                }
            },
            verifyToken: async (token) => {
                let result = false;
                try {
                    const { Data } = await Service.verifyToken(token);
                    if (Data) {
                        AsyncStorage.setItem('@userToken', token);
                        if (JSON.stringify(Data) === JSON.stringify(userData)) {
                            console.log('No changes');
                        } else {
                            let updatedUserData = { name: 'userData', value: { ...Data[0] } };
                            updateUserData(updatedUserData);
                        }
                        setUserToken(token);
                        result = true;
                    } else {
                        return result;
                    }
                } catch (error) {
                    console.log('authContext -> error', error);
                    throw result;
                }
                return result;
            },
            signOut: () => {
                setLogoutModalVisible(true);
            },
            getUpdatedUserData: async () => {
                let result = false;
                try {
                    // const token = await getToken('@userToken');
                    // const verifyResult = await authContext.verifyToken(token, true);
                    // result = verifyResult;
                } catch (error) {
                    throw error;
                }
                return result;
            },
            showAuthFailModal: (body) => {
                setSessionExpiredModalVisible(true);
            },
            showFlashMessage: (body) => {
                showMessage(body);
            },
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firebaseToken, userData, notificationCount]);

    const signOutHandler = async (_type) => {
        setLogoutLoading(true);
        try {
            if (_type === 'logout') {
                const data = {
                    AccountID: userData.AccountID,
                    Token: firebaseToken,
                };
                await Service.logout(data);
            }
            setUserToken(null);
            AsyncStorage.removeItem('@userToken');
            AsyncStorage.removeItem('@cart');
        } catch (error) {
        } finally {
            setLogoutLoading(false);
            setSessionExpiredModalVisible(false);
            setLogoutModalVisible(false);
            setUserToken(null);
            AsyncStorage.removeItem('@userToken');
            AsyncStorage.removeItem('@cart');
        }
    };

    const getFcmToken = async () => {
        let result = false;
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
            result = fcmToken;
            setFirebaseToken(fcmToken);
        } else {
        }
        return result;
    };

    const requestFirebasePermission = async () => {
        let result;
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        // console.log('requestPermission -> enabled', enabled);
        if (enabled) {
            await getFcmToken().then(res => {

                result = res;
            });
        }
        else {
            result = 'auth failed';
            console.log('Authorization failed:', authStatus);
        }
        return result;
    };

    const init = async () => {
        try {
            await AsyncStorage.getItem('@onboarding').then(value => setOnboarding(value));
            await AsyncStorage.getItem('@userToken')
                .then(async token => {
                    try { if (token) await authContext.verifyToken(token); else { clearData(); } }
                    catch (error) {
                        if (error === 'Authorization has been denied for this request.') {
                            clearData();
                        }
                        console.log('init -> error', error);
                        setUserToken('');
                    }
                });
            requestFirebasePermission();

            const unsubscribe = messaging().onMessage(async newMessage => {
                try {
                    if (newMessage?.notification?.android?.channelId) {
                        sound[newMessage?.notification?.android?.channelId].play();
                    } else {
                        sound.default.play();
                    }
                    await notificationCountHandler();
                    showMessage({
                        type: 'info',
                        duration: 2400,
                        message: newMessage?.notification?.title,
                        description: newMessage?.notification?.body,
                        position: 'top',
                        titleStyle: { fontSize: 18 },
                        textStyle: { fontSize: 12 },
                        color: colors.white,
                        backgroundColor: colors.primary,
                        onPress: () => {
                            if (newMessage?.notification?.android?.channelId) {
                                sound[newMessage?.notification?.android?.channelId].stop();
                            } else {
                                sound.default.stop();
                            }
                            navigationRef.current.navigate('Notifications', { fromNotification: true });
                        },
                        hideOnPress: true,
                        floating: true,
                    });
                } catch (error) {
                    Sentry.captureException(error.response.status);
                }
            });

            // quit state
            messaging().getInitialNotification().then(async remoteMessage => {
                const isLoggedIn = navigationRef.current.getRootState().routeNames[0] === 'App';
                if (remoteMessage) {
                    if (isLoggedIn) {
                        const pushAction = await CommonActions.navigate('Home',
                            { fromNotification: true, notification: remoteMessage.notification.body });
                        navigationRef.current.dispatch(pushAction);

                    } else {
                        // navigationRef.current.navigate('Home', { screen: 'Login', params: { fromNotification: true, notification: remoteMessage.notification.body } });
                    }
                }
            });

            //background
            messaging().onNotificationOpenedApp(async remoteMessage => {
                const isLoggedIn = navigationRef.current.getRootState().routeNames[0] === 'App';
                if (remoteMessage) {
                    if (isLoggedIn) {
                        const pushAction = await CommonActions.navigate('Home',
                            { fromNotification: true, notification: remoteMessage.notification.body });
                        navigationRef.current.dispatch(pushAction);
                    } else {
                        // navigationRef.current.navigate('Home', { screen: 'Login', params: { fromNotification: true, notification: remoteMessage.notification.body } });
                    }
                }
            });

            const notificationCountHandler = async () => {
                try {
                    const count = notificationCount?.count > 0 ? notificationCount?.count + 1 : 1;
                    let updateUserCount = { name: 'notificationCount', value: { count } };
                    updateUserData(updateUserCount);
                } catch (error) {
                    console.log('Inside Catch => ', error);
                }
            };

            return () => {
                unsubscribe();
            };

        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setTimeout(() => {
                SplashScreen.hide();
            }, 300);
        }
    };
    const internetConnectionHandler = () => {
        const unsubscribe = NetInfo.addEventListener(({ isConnected }) => {
            if (!isConnected) {
                setTimeout(() => {
                    setNoNetworkModalVisible(true);
                }, 1000);
            } else {
                setNoNetworkModalVisible(false);
            }
        });
        return () => {
            unsubscribe();
        };
    };

    useEffect(() => {
        Geocoder.init('AIzaSyDhPP1dtLUa3rH1TuXk5eFR_4QOmqSOZh4');
        init();
        internetConnectionHandler();
    }, []);

    return (
        <>
            <AuthContext.Provider value={authContext}>
                <NavigationContainer ref={navigationRef}>
                    <RootStackScreen
                        userToken={userToken}
                        onboarding={onboarding}
                    />
                </NavigationContainer>
                <FlashMessage ref={flashMessageRef} />
            </AuthContext.Provider>
            <Modal setVisible={setLogoutModalVisible} visible={logoutModalVisible}>
                <LogoutComponent cancelHandler={() => setLogoutModalVisible(false)}
                    pressHandler={signOutHandler.bind(this, 'logout')} loading={logoutLoading}
                />
            </Modal>
            <Modal
                onBackdropPress={() => { }}
                setVisible={setSessionExpiredModalVisible}
                visible={sessionExpiredModalVisible}>
                <SessionExpired
                    cancelHandler={() => setLogoutModalVisible(false)}
                    pressHandler={signOutHandler.bind(this, 'session')}
                    loading={logoutLoading}
                />
            </Modal>
            <Modal
                onBackdropPress={() => { }}
                setVisible={setNoNetworkModalVisible}
                visible={noNetworkModalVisible}
                animationIn="fadeIn"
                animationOut="fadeOut"
            >
                <NoInternet
                    internetConnectionHandler={internetConnectionHandler}
                    cancelHandler={() => setNoNetworkModalVisible(false)}
                    title="No Internet Connection"
                />
            </Modal>
        </>
    );
};


export default AppNavigation;
