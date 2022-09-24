import * as actionTypes from './actionTypes';

export function adduserdata(data) {
    return {
        type: actionTypes.ADD_USER_DATA,
        data,
    };
}
export function updatedata(data) {
    return {
        type: actionTypes.UPDATE_DATA,
        data,
    };
}
export function clearuserdata() {
    return {
        type: actionTypes.CLEAR_USER_DATA,
    };
}
export function clearuserdetails() {
    return {
        type: actionTypes.CLEAR_USER_DETAILS,
    };
}

export function removecartdata() {
    return {
        type: actionTypes.REMOVE_CART_DATA,
    };
}
