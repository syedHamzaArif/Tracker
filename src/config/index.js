import Axios from '../../axios';
// import Axios from 'axios';

import { errorHandler } from './errorHandler';

export const Apis = {
    register: 'user/register',
    login: 'Token',
    logout: 'api/Account/Logout',
    verifyToken: 'api/Custom/VerifyToken',
    userInfo: 'user/me',
    // liveTracking: 'api/Custom/GetLiveLatLong', // v1
    // liveTracking: 'api/Custom/GetLiveVehicles', // v2
    liveTracking: 'api/Custom/GetLiveVehicles', // v3
    // getAllTrips: 'api/Custom/GetTripsFilterWiseCDashboard', //v1
    // getAllTrips: 'api/Custom/GetTripsFilterWise',//v2
    getAllTrips: 'api/Trip/GetTripsFilterWise',//v3
    // getTripsIdWise: 'api/Custom/GetIndividualTripIDWise', // v1
    getTripsIdWise: 'api/Trip/GetTripDetailsByID', // v2
    getComplainList: 'api/Complaint/GetComplaints',
    getComplainCategory: 'api/Complaint/GetComplaintCategories',
    getComplainType: 'api/Complaint/GetComplaintTypes',
    addComplaint: 'api/Complaint/AddComplaint',
    // getTrackerIDWise: 'api/Custom/TrackersCustomerIDWise', //v1
    getTrackerIDWise: 'api/Custom/TrackersByAccID',//v2
    getCityList: 'api/Custom/GetCity',
    getComplainDetails: 'api/Complaint/GetComplaintDetails',
    addDeletePreNotify: 'api/Custom/AddDeletePreNotify',
    getPreNotify: 'api/Custom/GetPreNotificationsListCustomerWise',
    getDistanceReport: 'api/Reports/GetWeeklyVehicleReportFilterWise',
    setCustomerParams: '/api/Custom/SetCustomerParams',
    getParkedReport: 'api/Reports/GetParkedReportFilterWise',
    VehicleActivityReport: '/api/Reports/GetVehicleActivityReport',
    speedMilageReport: 'api/Custom/AvgSpeedDistanceMilage',
    getNotificationTypes: 'api/Custom/GetNotificationTypes',
    getNotificationList: 'api/Custom/GetUserNotifications',
    deleteNotification: 'api/Custom/DeleteUserNotifications',
    getSpeedMilage: 'api/Custom/GetSpeedMilageTrackerWise',
    getParkedRunningIdle: 'api/Reports/TotalOverAllMins',
    weeklyAvgSpeed: 'api/Reports/GetAvgSpeedReportFilterWise',
    changePassword: '/api/Account/ChangePassword',
    forgetPassword: 'api/Account/ForgotPassword',
    ResetPassword: 'api/Account/ResetPassword',
    getProfile: 'api/User/GetDetailsForUpdateProfile',
    updateProfile: 'api/User/UpdateProfile',
    getGeoFencingList: 'api/Custom/GetGeoFenceFilterWise',
    createGeoFencing: 'api/Custom/AddGeoFencing',
    deleteGeoFencing: 'api/Custom/DeleteGeoFence',
    getDetailsGeoFencing: 'api/Custom/GetGeoFenceDetailsGeoFenceIDWise',
    resetNotification: 'api/Custom/ResetNotificationCountsByNotificationType',
};

export const headers = {
    'content-type': 'application/json',
};

export const get = async (endPoint, token) => {
    try {
        const result = await Axios.get(endPoint, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return result;
    } catch (e) {
        throw errorHandler(e);
    }
};

export const post = async (endPoint, data, token) => {
    try {
        const result = await Axios.post(endPoint, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return result;
    } catch (e) {
        throw errorHandler(e);
    }
};
