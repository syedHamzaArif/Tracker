/* eslint-disable no-shadow */
/* eslint-disable no-catch-shadow */
import Button from '#common/Button';
import ComplaintModalList from '#common/ComplaintModalList';
import Modal from '#common/Modal';
import Typography from '#common/Typography';
import { Service } from '#config/service';
import { colors } from '#res/colors';
import { responsiveHeight } from '#util/responsiveSizes';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { showPopUpMessage } from '#util/index';



const RegisterComplaint = ({ navigation }) => {

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mmm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var hh = String(today.getHours()).padStart(2, '0');
    var mm = String(today.getMinutes()).padStart(2, '0');
    var time = `${hh}:${mm}`;
    console.log('file: RegisterComplaint.js => line 26 => RegisterComplaint => time', time);
    today = yyyy + '-' + mmm + '-' + dd;

    const { userData } = useSelector(state => state.userReducer);

    const [isLoading, setIsLoading] = useState(false);
    //api fetch data
    const [error, setError] = useState(false);
    const [complaintCategoryData, setComplaintCategoryData] = useState('');
    const [complaintTypeData, setComplaintTypeData] = useState('');
    // modal
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [typeModalVisible, setTypeModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    // type
    const [complaintType, setComplaintType] = useState('');
    // set selected Data
    const [complainSelectedData, setComplainSelectedData] = useState('');
    const [typeSelectedData, setTypeSelectedData] = useState('');
    const [complaintMessage, setComplaintMessage] = useState('');
    const [subjectMessage, setSubjectMessage] = useState('');

    useEffect(() => {
        getDataWrapper();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getDataWrapper = async () => {
        setIsLoading(true);
        try {
            await getComplainCategoryList();
            await getComplainTypeList();
        } catch (error) {
            console.log('file: RegisterComplaint.js => line 26 => getDataWrapper => error', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getComplainCategoryList = async () => {
        try {
            const { Data } = await Service.getComplainCategory();
            setComplaintCategoryData(Data);
        } catch (error) {
            console.log('Inside Catch => ', error);
        }
    };

    const getComplainTypeList = async () => {
        try {
            const { Data } = await Service.getComplainType();
            setComplaintTypeData(Data);
        } catch (error) {
            console.log('Inside Catch => ', error);
        }
    };

    const newsPressHandler = (_value) => {
        console.log('file: RegisterComplaint.js => line 79 => newsPressHandler => _value', _value);
        if (complaintType === 'category') {
            setComplainSelectedData(_value);
            setCategoryModalVisible(false);
        } else {
            setTypeSelectedData(_value);
            setTypeModalVisible(false);
        }
    };

    const buttonPressHandler = (type) => {
        setComplaintType(type);
        if (type === 'category') {
            setCategoryModalVisible(true);
        } else {
            setTypeModalVisible(true);
        }
    };

    const submitPressHandler = async () => {
        setIsLoading(true);
        setConfirmModalVisible(false);
        const obj = {
            ComplaintCategoryID: complainSelectedData.ID,
            ComplaintTypeID: typeSelectedData.ID,
            ComplaintMsg: complaintMessage,
            PrimaryNumber: userData.PrimaryNumber,
            SecondaryNumber: userData.SecondaryNumber,
            CustomerAccID: userData.AccountID,
            ComplaintTime: time,
            ComplaintDate: today,
            ComplaintSubject: subjectMessage,
            PlatformID: 2,
        };
        console.log('file: RegisterComplaint.js => line 115 => submitPressHandler => obj', obj);
        try {
            const { Message } = await Service.addComplaint(obj);

            if (Message === 'Complaint Generated!') {
                showPopUpMessage('Complaint Status', Message);
                navigation.goBack();
            }
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
        console.log('file: RegisterComplaint.js => line 108 => submitPressHandler => obj', obj);
    };

    const submitModalHandler = () => {
        console.log('file: RegisterComplaint.js => line 130 => submitModalHandler => complaintMessage', complaintMessage);
        if (complaintMessage === '') {
            setError('Required All Fields');
            return;
        }
        setError(false);
        setConfirmModalVisible(true);
    };

    return (
        <ScrollView contentContainerStyle={styles.root} keyboardShouldPersistTaps="handled">
            {
                isLoading ? <ActivityIndicator style={styles.loader} size={50} color={colors.primary} /> :
                    <>
                        <View>
                            <Typography size={12}
                                style={{ marginBottom: 5 }}
                                variant="small">SUBJECT</Typography>
                            <TextInput
                                style={styles.input}
                                onChangeText={(text) => {
                                    setSubjectMessage(text);
                                }}
                            />

                            {/* *********Complaint Category************* */}

                            <Typography size={12}
                                style={{ marginVertical: 5 }}
                                variant="small">COMPLAINT CATEGORY</Typography>
                            <TouchableOpacity style={[styles.input, { paddingVertical: 10 }]}
                                onPress={buttonPressHandler.bind(this, 'category')}
                            >
                                <Typography variant="medium">{complainSelectedData.Value ? complainSelectedData.Value : 'Select Complaint Category'}</Typography>
                                <Modal
                                    setVisible={setCategoryModalVisible}
                                    visible={categoryModalVisible}
                                    style={{ justifyContent: 'flex-start', marginTop: responsiveHeight(25) }}
                                >
                                    <ComplaintModalList
                                        data={complaintCategoryData}
                                        pressHandler={newsPressHandler}
                                        heading={'Select Complain Category'}
                                    />
                                </Modal>
                            </TouchableOpacity>

                            {/* *********Complaint Type************* */}

                            <Typography size={12}
                                style={{ marginVertical: 5 }}
                                variant="small">COMPLAINT TYPE</Typography>
                            <TouchableOpacity style={[styles.input, { paddingVertical: 10 }]}
                                onPress={buttonPressHandler.bind(this, 'type')}
                            >
                                <Typography variant="medium">{typeSelectedData.Value ? typeSelectedData.Value : 'Select Complaint Type'}</Typography>
                                <Modal
                                    setVisible={setTypeModalVisible}
                                    visible={typeModalVisible}
                                    style={{ justifyContent: 'flex-start', marginTop: responsiveHeight(35) }}
                                >
                                    <ComplaintModalList
                                        data={complaintTypeData}
                                        pressHandler={newsPressHandler}
                                        heading={'Select Complain Type'}
                                    />
                                </Modal>
                            </TouchableOpacity>

                            <Typography size={12}
                                style={{ marginVertical: 5 }}
                                variant="small">MESSAGE</Typography>
                            <TextInput
                                style={[styles.input, { height: responsiveHeight(40), textAlignVertical: 'top' }]}
                                multiline={true}
                                onChangeText={(text) => {
                                    setError('');
                                    setComplaintMessage(text);
                                }
                                }
                            />
                        </View>
                        {
                            error ? <Typography align="center" color={colors.warning}>{error}</Typography> : null
                        }
                        <Button style={{ marginVertical: 25 }} onPress={submitModalHandler} title="SUBMIT COMPLAINT" />
                        <Modal
                            setVisible={setConfirmModalVisible}
                            visible={confirmModalVisible}
                        >
                            <View style={styles.modalStyle}>
                                <Typography size={16}
                                    style={{ marginVertical: 15 }}
                                    variant="bold">Are You Sure?</Typography>
                                <Typography size={16}
                                    align="center"
                                    color={colors.textSecondary}
                                    style={{ marginVertical: 5, paddingHorizontal: 50 }}
                                    variant="small">Are you sure you want to submit this complaint?</Typography>
                                <View style={styles.row}>
                                    <TouchableOpacity style={[styles.modalButton]} onPress={() => setConfirmModalVisible(false)}>
                                        <Typography color={colors.textSecondary} size={16} align="center" variant="small">No</Typography>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalButton]} onPress={submitPressHandler}>
                                        <Typography size={16} variant="medium" align="center" style={{ color: colors.primary }} >Yes</Typography>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    </>
            }
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    root: {
        flexGrow: 1,
        marginHorizontal: 20,
        marginVertical: 20,
        justifyContent: 'space-between',
    },
    input: {
        backgroundColor: colors.white,
        borderColor: colors.black,
        borderWidth: 0.1,
        borderRadius: 1,
        padding: 4,
        color: colors.black,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    modalStyle: {
        backgroundColor: colors.background,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        paddingTop: responsiveHeight(3),
        alignItems: 'center',
    },
    modalButton: {
        width: '50%',
        // borderWidth: 0.25,
        borderColor: colors.textBody,
        paddingVertical: responsiveHeight(2),
        marginTop: responsiveHeight(2),
    },
    row: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
});

export default RegisterComplaint;
