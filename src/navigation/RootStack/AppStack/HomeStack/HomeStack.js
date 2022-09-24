import Typography from '#common/Typography';
import Complaints from '#containers/App/Complaints';
import ComplaintsDetails from '#containers/App/Complaints/ComplaintsDetail';
import RegisterComplaint from '#containers/App/Complaints/RegisterComplaint';
import GeoFencing from '#containers/App/GeoFencing';
import CreateGeoFencing from '#containers/App/GeoFencing/createGeoFencing';
import ShowGeoFencing from '#containers/App/GeoFencing/showGeoFencing';
import Home from '#containers/App/Home';
import MultipleTracker from '#containers/App/LiveTracking/MultipleTracker';
import SingleCustomer from '#containers/App/LiveTracking/SingleCustomer';
import ChangePassword from '#containers/App/MyProfile/ChangePassword/ChangePassword';
import MyProfile from '#containers/App/MyProfile/MyProfile';
import MyVehicles from '#containers/App/MyVehicles/MyVehicles';
import Notifications from '#containers/App/Notifications/Notifications';
import TopTabData from '#containers/App/PreNotify/TopTabNavigation';
import ReplayRoute from '#containers/App/ReplayRoute';
import RouteDetails from '#containers/App/ReplayRoute/RouteDetails';
import Reports from '#containers/App/Reports';
import DistanceReport from '#containers/App/Reports/ReportsType/DistanceReport';
import IdleReport from '#containers/App/Reports/ReportsType/IdleReport';
import IdleStops from '#containers/App/Reports/ReportsType/IdleStops';
import MileageReport from '#containers/App/Reports/ReportsType/MileageReport';
import ParkedReport from '#containers/App/Reports/ReportsType/ParkedReport';
import ParkedRunning from '#containers/App/Reports/ReportsType/ParkedRunning';
import SpeedDashboard from '#containers/App/Reports/ReportsType/SpeedDashboard';
import TripsDistanceSummary from '#containers/App/Reports/ReportsType/TripsDistanceSummary';
import TripsReports from '#containers/App/Reports/ReportsType/TripsReport';
import VehicleActivityReport from '#containers/App/Reports/ReportsType/VehicleActivityReport';
import VehicleBehaviorReport from '#containers/App/Reports/ReportsType/VehicleBehaviorReport';
import SetMileage from '#containers/App/SetSpeed/SetMileage';
import SetSpeed from '#containers/App/SetSpeed/SetSpeed';
import Trips from '#containers/App/Trips';
import TripsDetails from '#containers/App/Trips/TripsDetails';
import { colors } from '#res/colors';
import { getFonts, hitSlop } from '#util/index';
import { responsiveWidth } from '#util/responsiveSizes';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { TouchableOpacity, View,Linking } from 'react-native';
import { Icon } from 'react-native-elements';
import { useSelector } from 'react-redux';

const phoneNumber = '02136101457';

const HomeStack = createStackNavigator();
const HomeStackScreen = () => {
    const { notificationCount } = useSelector(state => state.userReducer);

    return (
        <HomeStack.Navigator
            screenOptions={({ navigation, route }) => {
                return ({
                    gestureDirection: 'horizontal',
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                    headerTitleAlign: 'center',
                    cardStyle: { backgroundColor: colors.background },
                    headerTitleStyle: {
                        color: colors.black,
                        fontSize: 18,
                        fontFamily: getFonts().bold,
                    },
                    headerStyle: {
                        backgroundColor: colors.white,
                        shadowColor: '#000',
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                        borderBottomWidth: 0,
                    },
                    headerLeft: () => (
                        <Icon name="chevron-left" type="font-awesome-5" underlayColor="transparent"
                            color={colors.textPrimary} hitSlop={hitSlop}
                            size={24}
                            containerStyle={{ padding: 8, marginLeft: responsiveWidth(2) }}
                            onPress={navigation.goBack} />
                    ),
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="ios-call" type="ionicon" size={24}
                                underlayColor="transparent" color={colors.textPrimary}
                                hitSlop={hitSlop}
                                containerStyle={{ padding: 8 }}
                                onPress={() => Linking.openURL(`tel:${phoneNumber}`)}
                            />
                            <View>
                                {
                                    notificationCount?.count > 0 &&
                                    <TouchableOpacity activeOpacity={0.7}
                                        hitSlop={hitSlop} onPress={() => navigation.navigate('Notifications')}
                                        style={{
                                            borderRadius: 10,
                                            backgroundColor: colors.primary,
                                            alignItems: 'center',
                                            position: 'absolute',
                                            right: 5,
                                            top: 5,
                                            zIndex: 1,
                                            width: responsiveWidth(5),
                                        }}>
                                        <Typography style={{ margin: 2 }} size={12} variant="bold" color={colors.white}>
                                            {notificationCount?.count > 0 && notificationCount?.count}
                                        </Typography>
                                    </TouchableOpacity>
                                }
                                <Icon name="notifications" type="ionicon" size={24}
                                    underlayColor="transparent" color={colors.textPrimary}
                                    hitSlop={hitSlop} onPress={() => navigation.navigate('Notifications')}
                                    containerStyle={{ padding: 8 }}
                                />
                            </View>
                        </View>
                    ),
                });
            }}
            mode="card"
        >
            <HomeStack.Screen name="Home" component={Home} />
            <HomeStack.Screen name="Geo Fencing" component={GeoFencing} />
            <HomeStack.Screen name="Create Geo Fence" component={CreateGeoFencing} />
            <HomeStack.Screen name="Show Geo Fence" component={ShowGeoFencing} />
            <HomeStack.Screen name="Pre-Notification" component={TopTabData} />
            <HomeStack.Screen name="Replay Route" component={ReplayRoute} />
            <HomeStack.Screen name="Route Details" component={RouteDetails} />
            <HomeStack.Screen name="Complaints" component={Complaints} />
            <HomeStack.Screen name="New Complaint" component={RegisterComplaint} />
            <HomeStack.Screen name="Complain Details" component={ComplaintsDetails} />
            <HomeStack.Screen name="Reports" component={Reports} />
            <HomeStack.Screen name="My Trips" component={Trips} />
            <HomeStack.Screen name="Trips Details" component={TripsDetails} />
            <HomeStack.Screen name="My Tracker" component={SingleCustomer} />
            <HomeStack.Screen name="Tracker" component={MultipleTracker} />
            <HomeStack.Screen name="Notifications" component={Notifications} />
            <HomeStack.Screen name="My Vehicles" component={MyVehicles} />
            <HomeStack.Screen name="My Profile" component={MyProfile} />
            <HomeStack.Screen name="Vehicle Behavior Report" component={VehicleBehaviorReport} />
            <HomeStack.Screen name="Trips Report" component={TripsReports} />
            <HomeStack.Screen name="Idle Stops" component={IdleStops} />
            <HomeStack.Screen name="Parked/Running/Idle Report" component={ParkedRunning} />
            <HomeStack.Screen name="Weekly Mileage Report" component={MileageReport} />
            <HomeStack.Screen name="Idle Report" component={IdleReport} />
            <HomeStack.Screen name="Parked Report" component={ParkedReport} />
            <HomeStack.Screen name="Weekly Speed Summary" component={SpeedDashboard} />
            <HomeStack.Screen name="Vehicle Activity Report" component={VehicleActivityReport} />
            <HomeStack.Screen name="Weekly Distance Report" component={DistanceReport} />
            <HomeStack.Screen name="Trips Distance Summary" component={TripsDistanceSummary} />
            <HomeStack.Screen
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
                }} name="Change Password" component={ChangePassword} />
            <HomeStack.Screen
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
                }} name="Speed Set" component={SetSpeed} />
            <HomeStack.Screen
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
                }} name="Mileage Set" component={SetMileage} />
        </HomeStack.Navigator>
    );
};

export default HomeStackScreen;
