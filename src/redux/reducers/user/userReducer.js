import * as actionTypes from '../../actions/actionTypes';

let empty = {};
let user = {
    accountType: 'employer',
};

export default function reducer(state = user, action) {
    switch (action.type) {
        case actionTypes.ADD_USER_DATA:
            return action.data;
        case actionTypes.UPDATE_DATA:
            return {
                ...state,
                [action.data.name]: action.data.value,
            };
        case actionTypes.CLEAR_USER_DETAILS:
            return empty;
        default:
            return state;
    }
}
