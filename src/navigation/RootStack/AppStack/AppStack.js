import { colors } from '#res/colors';
import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import DrawerContent from './DrawerContent';
import { Icon } from 'react-native-elements';
import HomeStackScreen from './HomeStack/HomeStack';

const AppStack = createDrawerNavigator();
const AppStackScreen = () => {
    return (
        <AppStack.Navigator
            drawerContent={(_props) => <DrawerContent {..._props} navigation={_props.navigation} />}
            drawerContentOptions={{
                activeBackgroundColor: colors.primary,
                activeTintColor: colors.white,
                labelStyle: {
                    fontSize: 16,
                },
            }}
            backBehavior="initialRoute"
            initialRouteName={HomeStackScreen}
        >
            <AppStack.Screen options={{
                drawerIcon: ({ focused }) => (
                    <Icon name="home" type="antdesign" size={24}
                        color={focused ? colors.secondary : colors.primary} />
                ),
                title: 'Home',
            }} name="Home" component={HomeStackScreen} />
        </AppStack.Navigator>
    );
};

export default AppStackScreen;
