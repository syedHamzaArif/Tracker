import axios from 'axios';

// export const server = 'https://tapi.tracker-iot.com/'; //ahsan bhai
export const server = 'https://api.tracker-iot.com/'; // zeeshan bhai
// export const server = 'https://uatapi.tracker-iot.com/'; // new live

const instance = axios.create({
    baseURL: server,
    timeout: 60000,
    timeoutErrorMessage: 'Connection Timeout, Internet is slow.',
});

export default instance;
