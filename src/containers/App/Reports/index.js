import images from '#assets/';
import Typography from '#common/Typography';
import { colors } from '#res/colors';
import { responsiveHeight } from '#util/responsiveSizes';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';

const screensData = [
    { name: 'Trips Report', images: images.GeoFence, navigation: 'Trips Report' },
    { name: 'Distance Summary', images: images.reports8, navigation: 'Weekly Distance Report' },
    { name: 'Idle Report', images: images.reports3, navigation: 'Idle Report' },
    { name: 'Mileage Summary', images: images.reports7, navigation: 'Weekly Mileage Report' },
    { name: 'Parking Analysis', images: images.reports5, navigation: 'Parked Report' },
    { name: 'Parked/Running/Idle', images: images.reports4, navigation: 'Parked/Running/Idle Report' },
    { name: 'Speed Summary', images: images.reports2, navigation: 'Weekly Speed Summary' },
    // { name: 'Idle Stops', images: images.reports3, navigation: 'Idle Stops' },
    { name: 'Trips Distance Summary', images: images.reports8, navigation: 'Trips Distance Summary' },
    { name: 'Vehicle Activity', images: images.reports5, navigation: 'Vehicle Activity Report' },
    // { name: 'Vehicle Behavior', images: images.reports1, navigation: 'Vehicle Behavior Report' },
];

const Reports = ({ navigation }) => {

    const renderData = ({ item, index }) => {
        return (
            <TouchableOpacity activeOpacity={0.8} key={`card${index}`} style={styles.itemContainer}
                onPress={() => {
                    // navigation.navigate(item.navigation);
                    item.navigation !== 'Vehicle Behavior Report' ? navigation.navigate(item.navigation) : null;
                    // item.navigation === 'Trips Report' ? navigation.navigate(item.navigation) : null;
                }}
            >
                <Image source={item.images} resizeMode="contain"
                    style={{ width: '30%', height: 50 }} />
                <Typography variant="bold" >{item.name}</Typography>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.root}>
            <FlatList
                data={screensData}
                renderItem={renderData}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        paddingHorizontal: 10,
        backgroundColor: colors.background,
    },
    itemContainer: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        backgroundColor: 'white',
        elevation: 5,
        margin: responsiveHeight(1),
        width: '95%',
        alignItems: 'center',
        borderRadius: 10,
        paddingHorizontal: 4,
        paddingVertical: 10,
        flexDirection: 'row',
    },
});

export default Reports;
