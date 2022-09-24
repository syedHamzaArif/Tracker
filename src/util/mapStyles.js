/* eslint-disable quotes */
import { colors } from "#res/colors";

export default [
    {
        'elementType': 'geometry',
        'stylers': [
            {
                'color': '#f5f5f5',
            },
        ],
    },
    {
        'elementType': 'labels.icon',
        'stylers': [
            {
                'visibility': 'on',
            },
        ],
    },
    {
        'elementType': 'labels.text.fill',
        'stylers': [
            {
                'color': '#616161',
                // 'color': colors.primary, //  Area Wise
            },
        ],
    },
    {
        'elementType': 'labels.text.stroke',
        'stylers': [
            {
                'color': '#f5f5f5',
                // 'color': colors.primary, // all area name
            },
        ],
    },
    {
        'featureType': 'administrative.land_parcel',
        'elementType': 'labels.text.fill',
        'stylers': [
            {
                'color': '#bdbdbd',
                // 'color': colors.primary,
            },
        ],
    },
    {
        'featureType': 'poi',
        'elementType': 'geometry',
        'stylers': [
            {
                'color': '#eeeeee',
                // 'color': colors.primary,
            },
        ],
    },
    {
        'featureType': 'poi',
        'elementType': 'labels.text.fill',
        'stylers': [
            {
                'color': '#757575',
                // 'color': colors.primary, // all name
            },
        ],
    },
    {
        'featureType': 'poi.park',
        'elementType': 'geometry',
        'stylers': [
            {
                'color': '#e5e5e5',
                // 'color': colors.primary,
            },
        ],
    },
    {
        'featureType': 'poi.park',
        'elementType': 'labels.text.fill',
        'stylers': [
            {
                'color': '#9e9e9e',
                // 'color': colors.primary,

            },
        ],
    },
    {
        'featureType': 'road',
        'elementType': 'geometry',
        'stylers': [
            {
                'color': '#ffffff',

            },
        ],
    },
    {
        'featureType': 'road.arterial',
        'elementType': 'labels.text.fill',
        'stylers': [
            {
                'color': '#757575',
            },
        ],
    },
    {
        'featureType': 'road.highway',
        'elementType': 'geometry',
        'stylers': [
            {
                'color': colors.primary, // all paths
                // 'color': '#dadada',
            },
        ],
    },
    {
        'featureType': 'road.highway',
        'elementType': 'labels.text.fill',
        'stylers': [
            {
                'color': '#616161',
            },
        ],
    },
    {
        'featureType': 'road.local',
        'elementType': 'labels.text.fill',
        'stylers': [
            {
                'color': '#9e9e9e',
            },
        ],
    },
    {
        'featureType': 'transit.line',
        'elementType': 'geometry',
        'stylers': [
            {
                'color': '#e5e5e5',
            },
        ],
    },
    {
        'featureType': 'transit.station',
        'elementType': 'geometry',
        'stylers': [
            {
                'color': '#eeeeee',
                // 'color': colors.primary,
            },
        ],
    },
    {
        'featureType': 'water',
        'elementType': 'geometry',
        'stylers': [
            {
                'color': '#c9c9c9',
            },
        ],
    },
    {
        'featureType': 'water',
        'elementType': 'geometry.fill',
        'stylers': [
            {
                'color': '#00A3D8',
            },
        ],
    },
    {
        'featureType': 'water',
        'elementType': 'labels.text.fill',
        'stylers': [
            {
                'color': '#9e9e9e',
            },
        ],
    },
];
