import React, { useEffect,memo } from 'react'
import {  useSelector } from 'react-redux'
import { startConnection } from '../../utils/signalr';

const NotificationsHubConnector = () => {
    const userProfileInfo = useSelector(state => state.userConfig.details);
    const connectToHub = () => {
        if (userProfileInfo?.id) {
            startConnection(userProfileInfo.id);
        }
    };
    useEffect(() => {
        if (userProfileInfo?.id) {
            connectToHub();
        }
    }, [userProfileInfo?.id]);
    return (
        <></>
    )
}

export default memo(NotificationsHubConnector)