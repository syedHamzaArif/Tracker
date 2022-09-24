import { Apis, get, post } from './';
const qs = require('query-string');
import AsyncStorage from '@react-native-community/async-storage';
const getToken = () => AsyncStorage.getItem('@userToken').then((value) => value);

export const Service = {
    register: async (data) => {
        let result = await post(Apis.register, qs.stringify(data));
        if (result.status === 200) return result.data;
        else throw result;
    },
    login: async (data) => {
        let result = await post(Apis.login, qs.stringify(data));
        if (result.status === 200) return result.data;
        else throw result;
    },
    logout: async (_data) => {
        const updatedToken = await getToken();
        let result = await post(Apis.logout, _data, updatedToken);
        if (result.status === 200) return result.data;
        else throw result;
    },
    changePassword: async (_data) => {
        const updatedToken = await getToken();
        let result = await post(Apis.changePassword, _data, updatedToken);
        if (result.status === 200) return result.data;
        else throw result;
    },
    verifyToken: async (token) => {
        let updatedToken = token;
        if (!token) {
            updatedToken = await getToken();
        }
        let result = await get(Apis.verifyToken, updatedToken);
        if (result.status === 200) return result.data;
        else throw result;
    },
    userInfo: async (token) => {
        let result = await get(Apis.userInfo, token);
        if (result.status === 200) return result.data;
        else throw result;
    },
    getTripsIdWise: async (_id) => {
        let result = await get(`${Apis.getTripsIdWise}?TripID=${_id}`);
        if (result.status === 200) return result.data;
        else throw result;
    },
    forgetPassword: async (_name) => {
        let result = await get(`${Apis.forgetPassword}?UserName=${_name}`);
        if (result.status === 200) return result.data;
        else throw result;
    },
    getComplainList: async (_id) => {
        let result = await post(`${Apis.getComplainList}`, _id);
        if (result.status === 200) return result.data;
        else throw result;
    },
    getComplainCategory: async () => {
        let result = await get(`${Apis.getComplainCategory}`);
        if (result.status === 200) return result.data;
        else throw result;
    },
    getTrackerIDWise: async (id) => {
        let result = await get(`${Apis.getTrackerIDWise}?AccountID=${id}`);
        if (result.status === 200) return result.data;
        else throw result;
    },
    getCityList: async () => {
        let result = await get(`${Apis.getCityList}`);
        if (result.status === 200) return result.data;
        else throw result;
    },
    getComplainDetails: async (_id) => {
        let result = await get(`${Apis.getComplainDetails}?ComplaintID=${_id}`);
        if (result.status === 200) return result.data;
        else throw result;
    },
    getPreNotify: async (_id) => {
        let result = await get(`${Apis.getPreNotify}?CustAccID=${_id}`);
        if (result.status === 200) return result.data;
        else throw result;
    },
    getComplainType: async () => {
        let result = await get(`${Apis.getComplainType}`);
        if (result.status === 200) return result.data;
        else throw result;
    },
    liveTracking: async (data) => {
        let result = await post(Apis.liveTracking, data);
        if (result.status === 200) return result.data;
        else throw result;
    },
    getAllTrips: async (data) => {
        const updatedToken = await getToken();
        let result = await post(Apis.getAllTrips, data, updatedToken);
        if (result.status === 200) return result.data;
        else throw result;
    },
    getParkedReport: async (data) => {
        const updatedToken = await getToken();
        let result = await post(Apis.getParkedReport, data, updatedToken);
        if (result.status === 200) return result.data;
        else throw result;
    },
    VehicleActivityReport: async (data) => {
        const updatedToken = await getToken();
        let result = await post(Apis.VehicleActivityReport, data, updatedToken);
        if (result.status === 200) return result.data;
        else throw result;
    },
    speedMilageReport: async (data) => {
        let result = await post(Apis.speedMilageReport, data);
        if (result.status === 200) return result.data;
        else throw result;
    },
    ResetPassword: async (data) => {
        let result = await post(Apis.ResetPassword, data);
        if (result.status === 200) return result.data;
        else throw result;
    },
    addComplaint: async (data) => {
        const updatedToken = await getToken();
        let result = await post(Apis.addComplaint, data, updatedToken);
        if (result.status === 200) return result.data;
        else throw result;
    },
    addDeletePreNotify: async (data) => {
        const updatedToken = await getToken();
        let result = await post(Apis.addDeletePreNotify, data, updatedToken);
        if (result.status === 200) return result.data;
        else throw result;
    },
    updateProfile: async (data) => {
        const updatedToken = await getToken();
        let result = await post(Apis.updateProfile, data, updatedToken);
        if (result.status === 200) return result.data;
        else throw result;
    },
    getDistanceReport: async (data) => {
        let result = await post(Apis.getDistanceReport, data);
        if (result.status === 200) return result.data;
        else throw result;
    },
    weeklyAvgSpeed: async (data) => {
        let result = await post(Apis.weeklyAvgSpeed, data);
        if (result.status === 200) return result.data;
        else throw result;
    },
    setCustomerParams: async (data) => {
        let result = await post(Apis.setCustomerParams, data);
        if (result.status === 200) return result.data;
        else throw result;
    },
    getNotificationList: async (data) => {
        let result = await post(Apis.getNotificationList, data);
        if (result.status === 200) return result.data;
        else throw result;
    },
    deleteNotification: async (data) => {
        let result = await post(Apis.deleteNotification, qs.stringify(data));
        if (result.status === 200) return result.data;
        else throw result;
    },
    getParkedRunningIdle: async (data) => {
        let result = await post(Apis.getParkedRunningIdle, data);
        if (result.status === 200) return result.data;
        else throw result;
    },
    getGeoFencingList: async (data) => {
        let result = await post(Apis.getGeoFencingList, data);
        if (result.status === 200) return result.data;
        else throw result;
    },
    getNotificationTypes: async () => {
        let result = await get(`${Apis.getNotificationTypes}`);
        if (result.status === 200) return result.data;
        else throw result;
    },
    getSpeedMilage: async (_id) => {
        let result = await get(`${Apis.getSpeedMilage}?TrackerID=${_id}`);
        if (result.status === 200) return result.data;
        else throw result;
    },
    getProfile: async () => {
        const updatedToken = await getToken();
        let result = await get(`${Apis.getProfile}`, updatedToken);
        if (result.status === 200) return result.data;
        else throw result;
    },
    getDetailsGeoFencing: async (_id) => {
        let result = await get(`${Apis.getDetailsGeoFencing}?ID=${_id}`);
        if (result.status === 200) return result.data;
        else throw result;
    },
    resetNotification: async (_id) => {
        let result = await get(`${Apis.resetNotification}?TypeID=0`);
        if (result.status === 200) return result.data;
        else throw result;
    },
    createGeoFencing: async (data) => {
        const updatedToken = await getToken();
        let result = await post(Apis.createGeoFencing, qs.stringify(data), updatedToken);
        if (result.status === 200) return result.data;
        else throw result;
    },
    deleteGeoFencing: async (data) => {
        let result = await post(Apis.deleteGeoFencing, qs.stringify(data));
        if (result.status === 200) return result.data;
        else throw result;
    },
};

