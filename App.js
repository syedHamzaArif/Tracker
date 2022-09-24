import AppNavigation from '#navigation/Index';
import store from '#redux/store';
import React from 'react';
import { LogBox } from 'react-native';
import { Provider } from 'react-redux';

const App = () => {
    LogBox.ignoreLogs(['Require cycle: node_modules', 'VirtualizedLists', 'Non-serializable values', 'Setting']);
    return (
        <Provider store={store}>
            <AppNavigation />
        </Provider>
    );
};

export default App;
