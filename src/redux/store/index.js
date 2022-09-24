import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import userReducer from '../reducers/user/userReducer';

const AppReducer = combineReducers({
    userReducer,
});

const logger = (store) => {
    return (next) => {
        return (action) => {
            const result = next(action);
            return result;
        };
    };
};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
    AppReducer,
    composeEnhancers(applyMiddleware(logger)),
);

export default store;
