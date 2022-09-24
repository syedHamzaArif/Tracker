import React, { useContext } from 'react';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { getFonts, height, width } from '#util/index';
import Typography from '#common/Typography';
import { colors } from '#res/colors';
import { getInitials } from '#util/index';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import { AuthContext } from '#context/';
import { responsiveHeight } from '#util/responsiveSizes';

const DrawerContent = (props) => {
    const { navigation: { navigate, closeDrawer } } = props;
    const { userData } = useSelector(state => state.userReducer);
    const initials = userData ? getInitials(userData?.UserName) : '';
    const { signOut } = useContext(AuthContext);

    return (
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.primary }} >
            <DrawerContentScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: 0, backgroundColor: colors.white }}>
                <View style={styles.header}>
                    <Icon name="cross" type="entypo" size={24}
                        underlayColor="transparent" color={colors.black}
                        onPress={closeDrawer}
                        containerStyle={styles.crossButton} />
                    {
                        initials ?
                            <TouchableOpacity activeOpacity={0.6} style={styles.avatarView}>
                                <Typography variant="bold" color={colors.white} size={20}>{initials}</Typography>
                            </TouchableOpacity> : <View />
                    }
                    <TouchableOpacity style={styles.accountButton}
                        onPress={() => navigate('My Profile')}
                    >
                        <View>
                            <Typography style={{ paddingLeft: 10 }} size={20} variant="bold" >{userData?.UserName}</Typography>
                            <Typography color={colors.textSecondary} style={{ paddingLeft: 10 }} size={13} variant="small" >{userData?.PrimaryNumber}</Typography>
                        </View>
                        <Icon name="chevron-right" type="entypo" size={24}
                            underlayColor="transparent" color={colors.black}
                        />
                    </TouchableOpacity>
                </View>
                {/* <DrawerItemList  {...props} labelStyle={{ fontSize: 14, fontFamily: getFonts().bold }} /> */}
                <View style={{ flexGrow: 1, marginTop: responsiveHeight(5) }}>

                    <DrawerItem {...props} label="My Vehicles"
                        labelStyle={{ fontSize: 14, fontFamily: getFonts().regular }}
                        icon={({ size, color }) => <Icon size={size} color={color} name="car" type="antdesign" />}
                        onPress={() => navigate('My Vehicles')}
                    />
                    <DrawerItem {...props} label="Notifications"
                        labelStyle={{ fontSize: 14, fontFamily: getFonts().regular }}
                        icon={({ size, color }) => <Icon size={size} color={color} name="bell" type="simple-line-icon" />}
                        onPress={() => navigate('Notifications')} />
                    <DrawerItem {...props} label="Complaints"
                        labelStyle={{ fontSize: 14, fontFamily: getFonts().regular }}
                        icon={({ size, color }) => <Icon size={size} color={color} name="message1" type="antdesign" />}
                        onPress={() => navigate('Complaints')} />
                    <DrawerItem {...props} label="Set Speed"
                        labelStyle={{ fontSize: 14, fontFamily: getFonts().regular }}
                        icon={({ size, color }) => <Icon size={size} color={color} name="speedometer" type="simple-line-icon" />}
                        onPress={() => navigate('Speed Set')} />
                    <DrawerItem {...props} label="Set Mileage"
                        labelStyle={{ fontSize: 14, fontFamily: getFonts().regular }}
                        icon={({ size, color }) => <Icon size={size} color={color} name="speedometer-sharp" type="ionicon" />}
                        onPress={() => navigate('Mileage Set')} />
                </View>

                <DrawerItem {...props} label="Log Out"
                    labelStyle={{ fontSize: 14, fontFamily: getFonts().regular }}
                    icon={() => <Icon size={16} name="logout" type="simple-line-icon" />}
                    onPress={signOut} />
            </DrawerContentScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    root: {
        flexGrow: 1,
    },
    header: {
        backgroundColor: colors.white,
        height: height * 0.2,
        marginBottom: height * 0.02,
        padding: width * 0.025,
        justifyContent: 'space-between',
        paddingVertical: height * 0.02,
    },
    avatarView: {
        backgroundColor: colors.primary,
        width: 65,
        height: 65,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
    },
    modalView: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    crossButton: {
        padding: 12,
        position: 'absolute',
        right: 4,
        top: 4,
    },
    accountButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        paddingHorizontal: 10,
        alignItems: 'center',
    },
});

export default DrawerContent;
