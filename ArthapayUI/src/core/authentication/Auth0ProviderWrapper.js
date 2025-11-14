// src/Auth0ProviderWrapper.js (or directly in App.js where Auth0Provider is)
import React, { useEffect } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { setGetAccessTokenSilently } from './auth0AccessToken'; // Adjust path

const Auth0ContentHandler = ({ children }) => {
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        // Set the function globally once it's available from the hook
        setGetAccessTokenSilently(getAccessTokenSilently);
    }, [getAccessTokenSilently]);

    return <>{children}</>;
};

const Auth0ProviderWrapper = ({ children, ...props }) => {
    return <Auth0Provider
        {...props}
    >
        <Auth0ContentHandler>
            {children}
        </Auth0ContentHandler>
    </Auth0Provider>
};

export default Auth0ProviderWrapper;