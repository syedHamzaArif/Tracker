import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Typography from '#common/Typography';
import { colors } from '#res/colors';
import { Service } from '#config/service';
import Button from '#common/Button';
import { useFocusEffect } from '@react-navigation/core';
import EmptyComponent from '#common/EmptyComponent';
import LoaderView from '#common/LoaderView';
import { useSelector } from 'react-redux';


const Complaints = ({ navigation }) => {

    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState('');
    const { userData: { AccountID } } = useSelector(state => state.userReducer);

    useFocusEffect(
        useCallback(() => {
            getComplainListHandler();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])
    );

    const refreshHandler = async () => {
        try {
            setRefreshing(true);
            await getComplainListHandler();
            setRefreshing(false);
        } catch (error) {
            console.log('Inside Catch => ', error);
        }
    };

    const getComplainListHandler = async () => {
        setIsLoading(true);
        try {
            const { Data } = await Service.getComplainList({ AccountID });
            setData(Data);
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderData = ({ item }) => {
        return (
            <TouchableOpacity style={styles.itemContainer} activeOpacity={0.7}
                onPress={() => navigation.navigate('Complain Details', { ComplaintID: item.ComplaintID })}
            >
                <Typography style={{ marginBottom: 10 }} variant="small">
                    <Typography>
                        Status
                    </Typography>
                    <Typography style={{
                        color: item.Status === 'Pending' ?
                            colors.yellow : item.Status === 'Issue Resolved' ?
                                colors.green : colors.red,
                    }}>
                        {` ${item.Status}`}
                    </Typography>
                </Typography>
                <Typography style={{ marginBottom: 10 }} size={17} variant="bold">{item.ComplaintSubject ? item.ComplaintSubject : 'No subject'}</Typography>
                <Typography variant="small">{`Your Complaint #${item.ComplaintID} has been Successful`}</Typography>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.root}>
            {
                isLoading ? <LoaderView /> :
                    <>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            data={data}
                            renderItem={renderData}
                            keyExtractor={(item, index) => index.toString()}
                            ListEmptyComponent={<EmptyComponent title="No Complaint" />}
                            contentContainerStyle={{ flexGrow: 1 }}
                            onRefresh={refreshHandler}
                            refreshing={refreshing}
                        />
                        <Button style={{ marginVertical: 25 }}
                            onPress={() => navigation.navigate('New Complaint')} title="REGISTER NEW COMPLAINT" />
                    </>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        paddingHorizontal: 10,
        // justifyContent: 'space-between',
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
        margin: 5,
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    rowItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
});

export default Complaints;

