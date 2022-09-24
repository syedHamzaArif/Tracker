import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import images from '#assets/index';
import Typography from '#common/Typography';
import { responsiveHeight, responsiveWidth } from '#util/responsiveSizes';
import { colors } from '#res/colors';
import { Icon } from 'react-native-elements';
import { hitSlop } from '#util/';
import { Service } from '#config/service';
import { useDispatch, useSelector } from 'react-redux';
import LoaderView from '#common/LoaderView';
import Modal from '#common/Modal';
import DeleteView from '#common/DeleteView';
import EmptyComponent from '#common/EmptyComponent';
import { Checkbox } from 'react-native-paper';
import { showPopUpMessage } from '#util/';
import { useFocusEffect } from '@react-navigation/native';
import { updatedata } from '#redux/actions/actionCreators';

const _keyExtractor = (item, index) => `notification${index}${item.id}`;

const Notifications = ({ navigation }) => {

    const [notificationList, setNotificationList] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [deleteMode, setDeleteMode] = useState(false);
    const [selected, setSelected] = useState([]);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const { userData: { AccountID } } = useSelector(state => state.userReducer);
    const dispatch = useDispatch();
    const updateUserData = (data) => dispatch(updatedata(data));

    // useFocusEffect(
    //     useCallback(() => {
    //         notificationCountHandler();
    //         // eslint-disable-next-line react-hooks/exhaustive-deps
    //     }, [])
    // );



    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="ios-call" type="ionicon" size={24}
                        underlayColor="transparent" color={colors.textPrimary}
                        hitSlop={hitSlop}
                        containerStyle={{ padding: 8 }}
                    />
                    {
                        notificationList?.length ?
                            deleteMode ?
                                <Icon name="check" type="font-awesome-5" size={20}
                                    underlayColor="transparent"
                                    hitSlop={hitSlop}
                                    containerStyle={{ padding: 8 }}
                                    onPress={checkPressHandler} />
                                : <Icon name="trash-alt" type="font-awesome-5" size={20}
                                    underlayColor="transparent"
                                    hitSlop={hitSlop}
                                    containerStyle={{ padding: 8 }}
                                    onPress={setDeleteMode.bind(this, true)}
                                />
                            : null
                    }
                </View>
            ),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deleteMode, navigation, notificationList, selected]);

    useEffect(() => {
        getNotificationTypesHandler();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const notificationCountHandler = async () => {
        const count = 0;
        let updateUserCount = { name: 'notificationCount', value: {} };
        updateUserData(updateUserCount);
        try {
            const result = await Service.resetNotification();
        } catch (error) {
            console.log('Inside Catch => ', error);
        }
    };

    const checkPressHandler = () => {
        if (!selected.length) {
            setDeleteMode(false);
        } else {
            setDeleteModalVisible(true);
        }
    };

    const getNotificationTypesHandler = async () => {
        setIsLoading(true);
        try {
            const { Data } = await Service.getNotificationTypes();
            await getNotificationListHandler();
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteModalPressHandler = async () => {
        setIsLoading(true);
        setDeleteModalVisible(false);
        const obj = {};
        for (const index in selected) {
            const { ID } = selected[index];
            obj['NotificationIDs[' + index + ']'] = ID;
        }
        try {
            const { Status } = await Service.deleteNotification(obj);
            if (Status) {
                getNotificationListHandler();
                showPopUpMessage('Delete Notifications', 'Notification has been deleted', 'success');
                setDeleteMode(false);
                setSelected([]);
            } else {
                showPopUpMessage('Delete Notifications', 'Something went wrong', 'danger');
            }
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getNotificationListHandler = async () => {
        setIsLoading(true);
        const obj = {
            AccountID: AccountID,
        };
        try {
            setNotificationList(Data);
            const { Data } = await Service.getNotificationList(obj);
            if (Data) {
                setNotificationList(Data[0].Data);
                await notificationCountHandler();
            } else {
                setNotificationList([]);
            }
        } catch (error) {
            console.log('Inside Catch => ', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setSelectedHandler = (item) => {
        const isAlreadySelected = selected.some(sel => sel.ID === item.ID);
        if (isAlreadySelected) {
            const filtered = selected.filter(sel => sel.ID !== item.ID);
            setSelected(filtered);
        } else {
            setSelected(_selected => [..._selected, item]);
        }
    };

    const _renderItem = ({ item, index }) => {
        console.log('file: Notifications.js => line 166 => Notifications => item', typeof item.IsRead);
        const isSelected = selected.some(_item => _item.ID === item.ID);
        return (
            <TouchableOpacity activeOpacity={0.8} style={[styles.item, { backgroundColor: item.IsRead === true ? colors.white : colors.highlightColor }]} onPress={setSelectedHandler.bind(this, item)} >
                <View style={[styles.row]}>
                    <View style={styles.imageView} >
                        <View style={{ padding: 20, margin: 10, flex: 1, backgroundColor: colors.gray, borderRadius: 100 }} >
                            <Image source={images.notification} style={{ flex: 1, width: null, height: null }}
                                resizeMode="contain" />
                        </View>
                    </View>
                    <View style={{ width: '60%' }} >
                        <Typography variant="bold">{item?.NotificationType}</Typography>
                        <Typography size={13} color={colors.textSecondary} variant="regular" >{item?.NotificationMsg}</Typography>
                        <Typography color={colors.primary} variant="regular" >{item?.ServerTime}</Typography>
                    </View>
                    <View>
                        {
                            deleteMode ?
                                <Checkbox.Android
                                    status={isSelected ? 'checked' : 'unchecked'}
                                    color={colors.primary}
                                />
                                : null
                        }
                    </View>
                </View>
            </TouchableOpacity>
            // </Swipeout>
        );
    };

    return (
        <>
            {
                isLoading ?
                    <LoaderView /> :
                    <FlatList
                        data={notificationList}
                        keyExtractor={_keyExtractor}
                        renderItem={_renderItem}
                        contentContainerStyle={{ flexGrow: 1 }}
                        ListEmptyComponent={<EmptyComponent title="No Notification Found" />}
                    />
            }
            <Modal style={{ justifyContent: 'center', alignItems: 'center' }}
                visible={deleteModalVisible} setVisible={setDeleteModalVisible}>
                <DeleteView pressHandler={deleteModalPressHandler} cancelHandler={() => setDeleteModalVisible(false)} />
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    root: {
        flexGrow: 1,
    },
    item: {
        padding: responsiveHeight(1),
        margin: responsiveHeight(1),
        borderRadius: 12,
        backgroundColor: colors.white,
    },
    imageView: {
        width: responsiveWidth(24),
        height: responsiveWidth(24),
        marginRight: responsiveWidth(2),
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default Notifications;
