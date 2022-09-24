
import Button from '#common/Button';
import ComplaintModalList from '#common/ComplaintModalList';
import LoaderView from '#common/LoaderView';
import Modal from '#common/Modal';
import Typography from '#common/Typography';
import { Service } from '#config/service';
import { AuthContext } from '#context/';
import { colors } from '#res/colors';
import { width, responsiveSize } from '#util/';
import { responsiveHeight } from '#util/responsiveSizes';
import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Input } from 'react-native-elements';
import { useSelector } from 'react-redux';

const SetSpeed = ({ navigation }) => {

    const { userData } = useSelector(state => state.userReducer);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [text, setText] = useState('');
    const [trackerId, setTrackerId] = useState('');
    const [maxSpeed, setMaxSpeed] = useState('');
    const [trackerIdWise, setTrackerIdWise] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [typeSelectedData, setTypeSelectedData] = useState('');
    const [typeModalVisible, setTypeModalVisible] = useState(false);

    const { showFlashMessage } = useContext(AuthContext);

    useEffect(() => {
        getTrackerIDWiseHandler();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getTrackerIDWiseHandler = async () => {
        setIsLoading(true);
        try {
            const { Data } = await Service.getTrackerIDWise(userData.AccountID);
            if (Data?.length === 1) {
                setTrackerId(Data[0]?.TrackerID);
                await getSpeedHandler(Data[0]?.TrackerID);
            }
            else {
                setTrackerIdWise(Data);
            }
        } catch (err) {
            console.log('Inside Catch => ', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getSpeedHandler = async (_id) => {
        setIsLoading(true);
        try {
            const { Data } = await Service.getSpeedMilage(_id);
            if (Data?.MaxSpeed) {
                setMaxSpeed(Data.MaxSpeed);
            }
        } catch (err) {
            console.log('Inside Catch => ', err);
        } finally {
            setIsLoading(false);
        }
    };

    const submitHandler = async () => {
        if (!text) {
            setError('Please set your maximum speed!');
            return;
        }
        setLoading(true);
        const obj = {
            AccountID: userData.AccountID,
            TrackerID: trackerId,
            Speed: text,
        };
        console.log('obj', obj);
        try {
            const { Message } = await Service.setCustomerParams(obj);
            if (Message === 'OK') {
                showFlashMessage({
                    message: 'Speed Status',
                    type: 'info',
                    duration: 1800,
                    position: 'top',
                    description: `Your Speed has been set ${text}`,
                    titleStyle: { fontSize: 18 },
                    textStyle: { fontSize: 12 },
                    backgroundColor: colors.primary,
                    color: colors.textPrimary,
                    hideOnPress: true,
                    floating: true,
                });
                navigation.goBack();
            }
        } catch (_err) {
            console.log('Inside Catch => ', _err);
            setError(_err);
        } finally {
            setLoading(false);
        }
    };
    const newsPressHandler = async (_value) => {
        console.log('file: index.js => line 165 => newsPressHandler => _value', _value.TrackerID);
        setTrackerId(_value.TrackerID);
        setTypeSelectedData(_value);
        setTypeModalVisible(false);
    };

    return (
        <>
            {
                isLoading ?
                    <LoaderView /> :
                    <>
                        <View style={styles.root}>
                            {
                                maxSpeed ? <Typography variant="regular">Your Speed set is {maxSpeed}</Typography> : null
                            }
                            {
                                trackerIdWise.length > 1 ?
                                    <>
                                        <TouchableOpacity style={[styles.inputModal, { paddingVertical: 10 }]}
                                            onPress={() => setTypeModalVisible(true)}
                                        >
                                            <Typography variant="medium">{typeSelectedData?.RegNumber ? typeSelectedData.RegNumber : 'Select Vehicle'}</Typography>
                                            <Modal
                                                setVisible={setTypeModalVisible}
                                                visible={typeModalVisible}
                                                style={{ marginVertical: responsiveHeight(15) }}
                                            >
                                                <ComplaintModalList
                                                    data={trackerIdWise}
                                                    pressHandler={newsPressHandler}
                                                    heading={'Reg #'}
                                                />
                                            </Modal>
                                        </TouchableOpacity>
                                    </>
                                    : null
                            }
                            <Typography variant="bold" size={22}>Set Your Speed Limit</Typography>
                            <View>
                                <Input
                                    inputContainerStyle={{
                                        width: '100%',
                                        borderBottomWidth: 0,
                                    }}
                                    style={styles.inputStyle}
                                    containerStyle={styles.input}
                                    autoCapitalize="none"
                                    onChangeText={(_text) => {
                                        setError('');
                                        setText(_text);
                                    }}
                                    value={text}
                                    placeholder={'Set Speed'}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                            {
                                error ? <Typography style={styles.error}>{error}</Typography> : null
                            }
                            <Button style={{ width: '90%' }} title="Done" loading={loading} onPress={submitHandler} />
                        </View>
                    </>
            }
        </>
    );
};

const styles = StyleSheet.create({
    root: {
        flexGrow: 1,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        padding: responsiveSize(3),
        backgroundColor: colors.background,
    },
    input: {
        paddingHorizontal: 12,
        height: 50,
        borderWidth: 1,
        backgroundColor: '#eee',
        borderRadius: 12,
        marginVertical: 8,
        borderColor: '#eee',
        padding: 3,
        width: width * 0.9,
    },
    inputModal: {
        backgroundColor: colors.white,
        borderColor: colors.black,
        borderWidth: 0.1,
        borderRadius: 1,
        padding: 4,
        color: colors.black,
        width: '100%',
        paddingHorizontal: 10,
    },
    inputStyle: {
        fontSize: 14,
        textAlign: 'center',
    },
    error: {
        fontSize: 12,
        textAlign: 'center',
        color: colors.warning,
    },
});

export default SetSpeed;
