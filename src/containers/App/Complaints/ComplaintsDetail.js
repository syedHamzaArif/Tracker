import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Typography from '#common/Typography';
import { colors } from '#res/colors';
import { Service } from '#config/service';
import Button from '#common/Button';
import { useFocusEffect } from '@react-navigation/core';
import LoaderView from '#common/LoaderView';

const ComplaintsDetails = ({ navigation, route }) => {

    const ComplaintID = route.params.ComplaintID;
    console.log('file: ComplaintsDetail.js => line 14 => ComplaintsDetails => ComplaintID', ComplaintID);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState('');

    useFocusEffect(
        useCallback(() => {
            getComplainListHandler();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])
    );


    const getComplainListHandler = async () => {
        setIsLoading(true);
        try {
            const { Data } = await Service.getComplainDetails(ComplaintID);
            console.log('file: ComplaintsDetail.js => line 30 => getComplainListHandler => Data', Data[0]);
            setData(Data[0]);
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <View style={styles.root}>
            {
                isLoading ? <LoaderView /> :
                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                        <View style={styles.itemContainer} activeOpacity={0.7} >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                <Typography size={14} color={colors.textSecondary} variant="small">{data?.ComplaintDate?.split('T')[0]}</Typography>
                                <Typography size={14} color={colors.textSecondary} variant="small">{data?.ComplaintTime?.split('T')[1]}</Typography>
                            </View>
                            <Typography style={{ marginBottom: 10 }} variant="small">
                                <Typography>
                                    Status
                                </Typography>
                                <Typography style={{
                                    color: data?.Status === 'Pending' ?
                                        colors.yellow : data.Status === 'Issue Resolved' ?
                                            colors.green : colors.red,
                                }}>
                                    {` ${data.Status}`}
                                </Typography>
                            </Typography>

                            <Typography style={{ marginBottom: 10 }} size={17} variant="bold">{data?.ComplaintSubject}</Typography>
                            <Typography color={colors.textSecondary} variant="medium">{`${data?.ComplaintMsg}`}</Typography>
                        </View>
                        <Button style={{ marginVertical: 25 }}
                            onPress={() => navigation.goBack()} title="GO BACK" />
                    </View>
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
        marginTop: 15,
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

export default ComplaintsDetails;

