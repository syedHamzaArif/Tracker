
import Button from '#common/Button';
import ComplaintModalList from '#common/ComplaintModalList';
import LoaderView from '#common/LoaderView';
import Modal from '#common/Modal';
import Typography from '#common/Typography';
import { Service } from '#config/service';
import { AuthContext } from '#context/';
import { colors } from '#res/colors';
import { width } from '#util/';
import { responsiveSize } from '#util/';
import { responsiveHeight } from '#util/responsiveSizes';
import React, { useContext, useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { View, StyleSheet } from 'react-native';
import { Input } from 'react-native-elements';
import { useSelector } from 'react-redux';


const SetMileage = ({ navigation }) => {

    const { userData } = useSelector(state => state.userReducer);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [text, setText] = useState('');
    const [trackerId, setTrackerId] = useState('');
    const [mileage, setMileage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [typeSelectedData, setTypeSelectedData] = useState('');
    const [typeModalVisible, setTypeModalVisible] = useState(false);
    const [trackerIdWise, setTrackerIdWise] = useState('');

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
            if (Data?.Milage) {
                setMileage(Data.Milage);
                console.log('file: SetSpeed.js => line 55 => getSpeedHandler => Max Speed', Data.Milage);
            }
        } catch (err) {
            console.log('Inside Catch => ', err);
        } finally {
            setIsLoading(false);
        }
    };

    const submitHandler = async () => {
        if (!text) {
            setError('Please set your Mileage!');
            return;
        }
        setLoading(true);
        const obj = {
            AccountID: userData.AccountID,
            TrackerID: trackerId,
            Milage: text,
        };
        try {
            const { Message } = await Service.setCustomerParams(obj);
            if (Message === 'OK') {
                showFlashMessage({
                    message: 'Mileage Status',
                    type: 'info',
                    duration: 1800,
                    position: 'top',
                    description: `Your Mileage has been set ${text} per ltr`,
                    titleStyle: { fontSize: 18 },
                    textStyle: { fontSize: 12 },
                    backgroundColor: colors.primary,
                    color: colors.white,
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
                                mileage ? <Typography variant="regular">Your Mileage set is {mileage}</Typography> : null
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
                            <Typography variant="bold" size={22}>Set Your Mileage Per Liter</Typography>
                            <View>
                                <Input
                                    inputContainerStyle={{
                                        width: '100%',
                                        borderBottomWidth: 0,
                                    }}
                                    style={styles.inputStyle}
                                    containerStyle={styles.input}
                                    autoCapitalize="none"
                                    onChangeText={(text) => {
                                        setError('');
                                        setText(text);
                                    }}
                                    value={text}
                                    placeholder={'Set Mileage'}
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

export default SetMileage;
