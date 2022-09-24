import Onboard from '#containers/onboard/Onboard';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import AppStackScreen from './AppStack/AppStack';
import AuthStackScreen from './AuthStack/AuthStack';

const RootStack = createStackNavigator();
const RootStackScreen = ({ onboarding, userToken, asGuest }) => {
    return (
        <RootStack.Navigator
            headerMode="none">
            {
                onboarding ?
                    userToken || asGuest ?
                        <RootStack.Screen name="App" component={AppStackScreen} />
                        :
                        <RootStack.Screen name="Auth" component={AuthStackScreen} />
                    :
                    <RootStack.Screen name="Onboard" component={Onboard} />

            }
        </RootStack.Navigator>
    );
};

export default RootStackScreen;
