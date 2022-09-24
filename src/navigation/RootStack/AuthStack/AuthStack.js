
import Login from '#containers/Auth/Login';
import { colors } from '#res/colors';
import { hitSlop } from '#util/';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import ForgotPassword from '#containers/Auth/ForgetPassword/ForgotPassword';
import { responsiveWidth } from '#util/responsiveSizes';
import { Icon } from 'react-native-elements';
import OTP from '#containers/Auth/ForgetPassword/OTP';
import ResetPassword from '#containers/Auth/ResetPassword/ResetPassword';

const AuthStack = createStackNavigator();
const AuthStackScreen = () => (
    <AuthStack.Navigator
        headerMode="none"
        screenOptions={params => ({
            gestureDirection: 'horizontal',
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        })}
        mode="card"
    >
        <AuthStack.Screen options={{ headerShown: false }} name="Login" component={Login} />
        <AuthStack.Screen name="ForgotPassword" component={ForgotPassword} />
        <AuthStack.Screen
            options={{
                headerRight: null, title: null,
                headerLeft: ({ onPress }) => {
                    return (
                        <Icon name="chevron-left" type="font-awesome-5" underlayColor="transparent"
                            color={colors.textPrimary} hitSlop={hitSlop}
                            size={24}
                            containerStyle={{ padding: 8, marginLeft: responsiveWidth(2) }}
                            onPress={onPress}
                        />
                    );
                },
                headerStyle: {
                    backgroundColor: colors.background,
                },
            }} name="OTP" component={OTP} />
        <AuthStack.Screen
            options={{
                headerRight: null, title: null, headerLeft: null,
                // headerLeft: ({ onPress }) => {
                //     return (
                //         <Icon name="chevron-left" type="font-awesome-5" underlayColor="transparent"
                //             color={colors.textPrimary} hitSlop={hitSlop}
                //             size={24}
                //             containerStyle={{ padding: 8, marginLeft: responsiveWidth(2) }}
                //             onPress={onPress}
                //         />
                //     );
                // },
                headerStyle: {
                    backgroundColor: colors.background,
                },
            }} name="Reset Password" component={ResetPassword} />
    </AuthStack.Navigator>
);

export default AuthStackScreen;
