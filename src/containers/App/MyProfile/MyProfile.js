/* eslint-disable react-hooks/exhaustive-deps */
import Typography from '#common/Typography';
import { colors } from '#res/colors';
import { responsiveHeight } from '#util/responsiveSizes';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, UIManager } from 'react-native';
import { useSelector } from 'react-redux';
import { responsiveSize } from '#util/';
import { Service } from '#config/service';
import LoaderView from '#common/LoaderView';
import Button from '#common/Button';
import Animated from 'react-native-reanimated';
import { AuthContext } from '#context/';

const { State: TextInputState } = TextInput;

const MyProfile = ({ navigation }) => {
    const { userData: { UserName } } = useSelector(state => state.userReducer);
    const [data, setData] = useState('');

    const [CNIC, setCNIC] = useState(data.CNIC ? data.CNIC : '');
    const [email, setEmail] = useState(data.Email ? data.Email : '');
    const [primaryNumber, setPrimaryNumber] = useState(data.PrimaryNumber ? data.PrimaryNumber : '');
    const [secondaryNumber, setSecondaryNumber] = useState(data.SecondaryNumber ? data.SecondaryNumber : '');
    const [address, setAddress] = useState(data.SecondaryNumber ? data.SecondaryNumber : '');
    const [cityID, setCityID] = useState(data.CityID ? data.CityID : '');
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showFlashMessage } = useContext(AuthContext);

    useEffect(() => {
        getProfileHandler();
    }, []);


    const getProfileHandler = async () => {
        setIsLoading(true);
        try {
            const { Data } = await Service.getProfile();
            setCNIC(Data[0].CNIC);
            setEmail(Data[0].Email);
            setPrimaryNumber(Data[0].PrimaryNumber);
            setSecondaryNumber(Data[0].SecondaryNUmber);
            setAddress(Data[0].Address);
            setCityID(Data[0].CityID);
            setData(Data[0]);
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async () => {
        console.log('file: MyProfile.js => line 111 => onSubmit => email', email);
        const obj = {
            Email: email,
            CNIC: CNIC,
            Address: address,
            PrimaryNumber: primaryNumber,
            SecondaryNumber: secondaryNumber,
            CityID: cityID,
        };
        console.log('file: MyProfile.js => line 54 => onSubmit => obj', obj);
        setLoading(true);
        try {
            const { Data } = await Service.updateProfile(obj);
            if (Data === 'Profile Updated Successfully') {
                showFlashMessage({
                    message: 'Profile Status',
                    type: 'info',
                    duration: 1800,
                    position: 'top',
                    description: Data,
                    titleStyle: { fontSize: 18 },
                    textStyle: { fontSize: 12 },
                    backgroundColor: colors.primary,
                    color: colors.white,
                    hideOnPress: true,
                    floating: true,
                });
                navigation.goBack();
                await getProfileHandler();
            }
            else {
                showFlashMessage({
                    message: 'Profile Not Updated',
                    type: 'info',
                    duration: 1800,
                    position: 'top',
                    description: Data,
                    titleStyle: { fontSize: 18 },
                    textStyle: { fontSize: 12 },
                    backgroundColor: colors.warning,
                    color: colors.white,
                    hideOnPress: true,
                    floating: true,
                });
            }
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={[styles.root]} keyboardShouldPersistTaps="handled">
            {/* <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}> */}
            {
                isLoading ? <LoaderView /> :
                    <>
                        <Typography size={24}
                            variant="bold">
                            {`Hello ${UserName}!`}
                        </Typography>
                        <Typography
                            style={{ marginVertical: 5, marginTop: responsiveHeight(4) }} variant="medium" color={colors.textSecondary}>EMAIL
                        </Typography>
                        <TextInput
                            value={email}
                            style={styles.input}
                            onChangeText={(text) => setEmail(text)}
                        />
                        <Typography
                            style={{ marginVertical: 5, marginTop: responsiveHeight(4) }} variant="medium" color={colors.textSecondary}>PRIMARY PHONE NUMBER
                        </Typography>
                        <TextInput
                            value={primaryNumber}
                            style={styles.input}
                            onChangeText={(text) => setPrimaryNumber(text)}
                            keyboardType="decimal-pad"
                        />
                        <Typography
                            style={{ marginVertical: 5, marginTop: responsiveHeight(4) }} variant="medium" color={colors.textSecondary}>SECONDARY PHONE NUMBER
                        </Typography>
                        <TextInput
                            value={secondaryNumber}
                            style={styles.input}
                            onChangeText={(text) => setSecondaryNumber(text)}
                            keyboardType="decimal-pad"
                        />
                        <Typography
                            style={{ marginVertical: 5, marginTop: responsiveHeight(4) }} variant="medium" color={colors.textSecondary}>CNIC
                        </Typography>
                        <TextInput
                            value={CNIC}
                            style={styles.input}
                            onChangeText={(text) => setCNIC(text)}
                            keyboardType="decimal-pad"
                        />
                        <Typography
                            style={{ marginVertical: 5, marginTop: responsiveHeight(4) }} variant="medium" color={colors.textSecondary}>Address
                        </Typography>
                        <TextInput
                            value={address}
                            style={styles.input}
                            onChangeText={(text) => setAddress(text)}
                        />
                        <TouchableOpacity onPress={() => navigation.navigate('Change Password')}>
                            <Typography
                                style={{ marginVertical: 5, marginTop: responsiveHeight(4) }} variant="bold" color={colors.primary}>
                                Change Password
                            </Typography>
                        </TouchableOpacity>
                        <Button style={{ marginBottom: responsiveHeight(1) }}
                            loading={loading} onPress={onSubmit} title="Update Profile" />
                    </>
            }
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    root: {
        flexGrow: 1,
        // marginHorizontal: 20,
        // marginVertical: 10,
        padding: responsiveSize(3),

        backgroundColor: colors.background,
    },
    input: {
        backgroundColor: colors.white,
        borderColor: colors.black,
        borderWidth: 0.1,
        borderRadius: 1,
        padding: 4,
        color: colors.black,
    },
});

export default MyProfile;
