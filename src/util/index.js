import { colors } from '#res/colors';
import { Alert, Dimensions, Linking, PermissionsAndroid, Platform } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import Geocoder from 'react-native-geocoding';
import RNLocation from 'react-native-location';
import signalr from 'react-native-signalr';
import { server } from '../../axios';

export const { width, height } = Dimensions.get('window');

export const hitSlop = { top: 20, bottom: 20, right: 20, left: 20 };

export const getDate = (date) => {
    var today = date;
    if (today.getDate) {
        var dd = String(today?.getDate()).padStart(2, '0');
        var mm = String(today?.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today?.getFullYear();
        // const SalesDate = mm + '/' + dd + '/' + yyyy
        today = mm + '-' + dd + '-' + yyyy;
    }
    return today;
};

export const getTime = (date) => {
    var hh = String(date?.getHours()).padStart(2, '0');
    var mmm = String(date?.getMinutes()).padStart(2, '0');
    var time = `${hh}:${mmm}`;
    return time;
};


export const askForPermissions = async () => {
    if (Platform.OS === 'ios') {
        let result = false;
        await RNLocation.requestPermission({ ios: 'whenInUse' })
            .then(res => {
                result = res;
            })
            .catch(err => {
                console.trace('something went wrong', err);
                result = false;
            });
        return result;
    } else {
        let result;
        let granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
            .then(response => {
                result = response; return response;
            })
            .catch(err => {
                throw err;
            });
        if (!granted) {
            await PermissionsAndroid.requestMultiple(
                [
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ])
                .then(response => {
                    if (response['android.permission.ACCESS_FINE_LOCATION'] === 'never_ask_again'
                    ) {
                        Alert.alert(
                            'Permissions Denied',
                            'Go to settings to turn then on',
                            [
                                {
                                    text: 'Go to settings',
                                    onPress: () => Linking.openSettings(),
                                },
                            ],
                            { cancelable: false }
                        );

                    }
                });
        } else { result = true; }
        return result;
    }
};

export const signalRConnection = async () => {
    const connection = signalr.hubConnection(server);
    connection.logging = true;

    try {
        const proxy = connection.createHubProxy('notificationHub');
        console.log('file: index.js => line 87 => signalRConnection => proxy', proxy);
        proxy.on('GetLiveTrackingData', (model) => {
            console.log('file: index.js => line 87 => proxy.on => model', model.data);
            // init(model.Data);
            return model.data;
        });

        connection.start({ jsonp: true }).done(async (result) => {
            console.log('file: index.js => line 92 => connection.start => result', result);
            // await getLiveLocation();
            proxy.invoke('helloServer', 'Hello Server, how are you?')
                .done((directResponse) => {
                    console.log('direct-response-from-server', directResponse);
                }).fail((_error) => {
                    console.log('file: SingleCustomer.js => line 104 => done => _error', _error);
                    console.log('Something went wrong when calling server, it might not be up and running?');
                });
        }).fail(() => {
            console.log('Failed');
        });

        //connection-handling
        connection.connectionSlow(() => {
            console.log('We are currently experiencing difficulties with the connection.');
        });

        connection.disconnected(async () => {
            setTimeout(function () {
                connection.start({ jsonp: true })
                    .done(function () {
                        console.log('connected');

                    })
                    .fail(function (a) {
                        console.log('not connected' + a);
                    });
            }, 5000); // Restart connection after 5 seconds.
        });

        connection.error((error) => {
            console.log('file: index.js => line 137 => connection.error => error', error);
            const errorMessage = error.message;
            let detailedError = '';
            if (error.source && error.source._response) {
                detailedError = error.source._response;
            }
            if (detailedError === 'An SSL error has occurred and a secure connection to the server cannot be made.') {
                console.log('When using react-native-signalr on ios with http remember to enable http in App Transport Security https://github.com/olofd/react-native-signalr/issues/14');
            }
            console.debug('SignalR error: ' + errorMessage, detailedError);
        });
    } catch (error) {
        console.log('file: index.js => line 150 => signalRConnection => error', error);
    }
};

export const getCurrentLocation = async () => {
    let result = false;
    try {
        await RNLocation.configure({
            distanceFilter: 1,
            interval: 100,
            androidProvider: 'auto',
            desiredAccuracy: {
                ios: 'best',
                android: 'highAccuracy',
            },
        });
        await RNLocation.getLatestLocation(1000)
            .then(position => {
                if (position) {
                    const { latitude, longitude } = position;
                    result = { latitude, longitude };
                }
            }).catch(err => {
                console.log('err', err);
                result = false;
            });
    } catch (error) {
        console.log('error', error);
        result = false;
    }
    return result;
};

export const getAddressCustomer = async (lat, long) => {
    let result = false;
    await Geocoder.from(lat, long)
        .then(json => {
            let city;
            let address;
            let streetAddress;
            for (const index in json.results) {
                const element = json.results[index];
                if (element.types[0] === 'route') {
                    // address = element.formatted_address;
                }
                if (element.types[0] === 'street_address') {
                    streetAddress = element.address_components[0].long_name;
                }
                for (const elementIndex in element.address_components) {
                    const formatted_address = element.address_components[elementIndex];
                    if (formatted_address.types[0] === 'locality') {
                        city = formatted_address.long_name;
                    }
                    if (formatted_address.types[1] === 'sublocality') {
                        address = formatted_address.long_name;
                    }
                }
            }
            result = { address, city, streetAddress };
        })
        .catch(error => console.log(error));
    return result;
};

export const getAddress = async (lat, long) => {
    let result = false;
    await Geocoder.from(lat, long)
        .then(json => {
            let city;
            let address;
            let streetAddress;
            for (const index in json.results) {
                const element = json.results[index];
                if (element.types[0] === 'route') {
                    address = element.formatted_address;
                }
                if (element.types[0] === 'street_address') {
                    streetAddress = element.address_components[0].long_name;
                }
                for (const elementIndex in element.address_components) {
                    const formatted_address = element.address_components[elementIndex];
                    if (formatted_address.types[0] === 'locality') {
                        city = formatted_address.long_name;
                    }
                }
            }
            result = { address, city, streetAddress };
        })
        .catch(error => console.log(error));
    return result;
};

export const getLocation = async (value) => {
    let result;
    await Geocoder.from(value)
        .then((res) => {
            result = res.results[0].geometry.location;
        })
        .catch((err) => {
            console.log('err', err);
        });
    return result;
};

export const responsiveSize = (num) => {
    let updatedNum = `0.0${num}`;
    return Math.floor(height * updatedNum);
};

export const getValue = (value) => {
    let result = '';
    if (typeof value === 'string') {
        if (value.includes('_')) {
            let splitValue = value.split('_');
            for (const part in splitValue) {
                let element = splitValue[part];
                element = element.charAt(0).toUpperCase() + element.slice(1);
                result = result + ' ' + element;
            }
            return result;
        }
        else if (value.includes('-')) {
            let splitValue = value.split('-');
            for (const part in splitValue) {
                let element = splitValue[part];
                element = element.charAt(0).toUpperCase() + element.slice(1);
                result = result + ' ' + element;
            }
            return result;
        }
        else {
            result = value.replace(/([A-Z])/g, ' $1');
            return result.charAt(0).toUpperCase() + result.slice(1);
        }
    } else return value;
};

export const showPopUpMessage = (title, description, type,) => {
    showMessage({
        message: title,
        type: type ? type : 'danger',
        duration: 2400,
        position: 'top',
        description: description,
        titleStyle: { fontSize: 18 },
        textStyle: { fontSize: 12 },
        color: 'white',
        backgroundColor: type === 'danger' ? colors.warning : colors.primary,
        hideOnPress: true,
        floating: true,
    });
};

export const isIOS = () => Platform.OS === 'ios';

export const getFonts = () => {
    return ({
        regular: isIOS() ? 'SFUIDisplay-Regular' : 'SF-UI-Display-Regular',
        light: isIOS() ? 'SFUIDisplay-Light' : 'sf-ui-display-light',
        bold: isIOS() ? 'SFUIDisplay-Bold' : 'sf-ui-display-bold',
        black: isIOS() ? 'SFUIDisplay-Black' : 'sf-ui-display-black',
        heavy: isIOS() ? 'SFUIDisplay-Heavy' : 'sf-ui-display-heavy',
        medium: isIOS() ? 'SFUIDisplay-Medium' : 'sf-ui-display-medium',
        semiBold: isIOS() ? 'SFUIDisplay-Semibold' : 'sf-ui-display-semibold',
        thin: isIOS() ? 'SFUIDisplay-Thin' : 'sf-ui-display-thin',
        ultraLight: isIOS() ? 'SFUIDisplay-Ultralight' : 'sf-ui-display-ultralight',
    });
};

export const getInitials = (string) => {
    if (!string) return null;
    var initials = string.match(/\b\w/g) || [];
    initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
    return initials;
};

export const timeConvert = (n) => {
    var num = n;
    var hours = (num / 60);
    var rHours = Math.floor(hours);
    var minutes = (hours - rHours) * 60;
    var rMinutes = Math.round(minutes);
    if (rHours) {
        return rHours + ' hr, ' + rMinutes + ' min';
    } else {
        return rMinutes + ' min';
    }
};


export const getRegionForCoordinates = (points) => {

    // points should be an array of { latitude: X, longitude: Y }
    let minX, maxX, minY, maxY;

    // init first point
    ((point) => {
        minX = point.latitude;
        maxX = point.latitude;
        minY = point.longitude;
        maxY = point.longitude;
    })(points[0]);

    // calculate rect
    points.map((point) => {
        minX = Math.min(minX, point.latitude);
        maxX = Math.max(maxX, point.latitude);
        minY = Math.min(minY, point.longitude);
        maxY = Math.max(maxY, point.longitude);
    });

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const deltaX = (maxX - minX);
    const deltaY = (maxY - minY);

    return {
        latitude: midX,
        longitude: midY,
        latitudeDelta: deltaX,
        longitudeDelta: deltaY,
    };
};
