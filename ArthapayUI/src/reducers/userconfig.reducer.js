import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { deriveErrorMessage } from '../core/shared/deriveErrorMessage';
import { ipStackClientMethods } from '../core/httpClients'
import { appClientMethods as coreClientMethods } from '../core/http.clients';
import { ApiControllers } from '../api/config';
import { groupMenuLinks } from '../core/layout/services';
import { decryptAES } from '../core/shared/encrypt.decrypt';
const { customers: customerController } = ApiControllers
const ipstackAccessKey = window.runtimeConfig.VITE_IPSTACK_ACCESS_KEY
export const fetchMenuLinks = createAsyncThunk('user/fetchMenuLinks', async (_, { rejectWithValue }) => {
    try {
        return await coreClientMethods.get(`security/menu`);
    } catch (error) {
        rejectWithValue(error.message)
    }
});

export const fetchScreenPermissions = createAsyncThunk('user/fetchScreenPermissions', async (currentScreen, { rejectWithValue }) => {
    try {
        const data = await coreClientMethods.get(`security/permissions/${currentScreen?.id}`);
        return data;
    } catch (error) {
        rejectWithValue(error.message)
    }
});

export const fetchUserDetails = createAsyncThunk('user/fetchUserDetails', async (_, { dispatch, rejectWithValue }) => {
    try {
        const data = await coreClientMethods.get(`customer`);
        if (data.customerState === 'Approved') {
            dispatch(fetchMenuLinks())
            dispatch(fetchVerifications())
        }
        if (data.metadata?.IsDocsRequested) {
            dispatch(fetchCasesData(data.id));
        }
        return data;
    } catch (error) {
        return rejectWithValue(error.message)
    }
});

export const fetchTwoFactorStatus = createAsyncThunk('user/fetchTwoFactorStatus', async (_, { dispatch, rejectWithValue }) => {
    try {
        const response = await coreClientMethods.get(`${customerController}twofactor`);
        dispatch(updateTwoFactor({ loading: false, isEnabled: response }));
    } catch (error) {
        rejectWithValue(error.message)
    }
});
export const fetchCasesData = createAsyncThunk('user/fetchCasesData', async ({ rejectWithValue }) => {
    try {
        const response = await coreClientMethods.get(`cases/alerts`);
        if (response) {
            return response
        }
        return rejectWithValue(deriveErrorMessage(response));
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const fetchNoticesData = createAsyncThunk(
    'user/fetchNoticesData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await coreClientMethods.get(`notices`);
            if (response) {
                return response;
            }
            return rejectWithValue(deriveErrorMessage(response));
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


export const logoutAuditlogs = createAsyncThunk(
    'user/logoutUser',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await coreClientMethods.post(
                'auditlog/logout',
                payload
            );
            if (response) {
                return response;
            }
            return rejectWithValue(deriveErrorMessage(response));
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


export const getIpRegistryData = createAsyncThunk('user/getIpRegistryData', async (_, { rejectWithValue }) => {
    try {
        const data = await ipStackClientMethods.get(`/check?access_key=${ipstackAccessKey}`);
        const userAgent = window?.navigator?.userAgent || '';
        const browserMatch = userAgent.match(/(chrome|firefox|msie|trident(?=\/))\/?\s*(\d+)/i);
        const osMatch = userAgent.match(/(Windows NT|Mac OS X|Linux|iPhone|iPad|iPod|Android)[^\s;)]*/i);
        const ipInfo = {
            Ip: data?.ip,
            Location: {
                countryName: data?.country_name,
                calling_code: data?.location?.calling_code,
                state: data.region_name,
                city: data?.city,
                postal: data?.zip,
                latitude: data?.latitude,
                longitude: data?.longitude,
            },
            Browser: browserMatch ? browserMatch[1] : 'Unknown',
            DeviceType: {
                name: userAgent.substring(userAgent.indexOf('(') + 1, userAgent.indexOf(')')).split(';')[0].trim(),
                type: data?.type,
                version: `${osMatch ? osMatch[0] : 'Unknown'} ${browserMatch ? browserMatch[2] : ''}`,
            },
        };
        return ipInfo;
    } catch (error) {
        rejectWithValue(error.message)
    }
});



export const fetchVerifications = createAsyncThunk(
    'user/fetchVerifications',
    async (_, { rejectWithValue }) => {
        try {
            const verifications = await coreClientMethods.get(`security/settings`)
            const allFalseOrNull = Object.entries(verifications || {}).every(([, value]) => value === null || value === false)
            return !allFalseOrNull
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

const initialState = {
    userProfileLoading: false, // For internal components loading state
    details: null,
    sk: null,
    metadata: {},
    trackAuditLogData: {},
    twoFA: { loading: true, isEnabled: false },
    userCasesInfo: { loader: false, data: null, error: '' },
    permissions: null,
    kycStatus: undefined,
    currentKycState: undefined,
    screens: null,
    currentScreen: null,
    currentRole: null,
    menuLinks: [],
    enabledModules: [],
    fetchingAppMenu: false,
    isSubscribed: false,
    verifications: { loading: false, hasVerifications: false, error: '' },
    noticeInfo: { loader: false, data: null, error: '' },
    reKycEnabled: false,
    isKycorKybFlowEbabled: false,
    isHelpLinkEnabled: false,
    helpLinkUrl: '',
    helpEnabledScreens: []

}
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearUserInfo: (state) => {
            state.details = null;
            state.permissions = null;
            state.metadata = {};
            state.screens = null;
            state.currentScreen = null;
            state.enabledModules = []
            state.trackAuditLogData = {};
        },
        updateDocRequest: (state, action) => {
            if (state.metadata) {
                state.metadata.isDocsRequested = action.payload;
            }
        },
        setPermissions: (state, action) => {
            state.permissions = action.payload;
        },
        setScreens: (state, action) => {
            state.screens = action.payload;
        },
        setCurrentScreen: (state, action) => {
            state.currentScreen = action.payload;
        },
        setCurrentRole: (state, action) => {
            state.currentRole = action.payload;
        },
        setMetadata: (state, action) => {
            state.metadata = action.payload
        },
        setEnabledModules: (state, action) => {
            state.enabledModules = action.payload
        },
        setCurrentKycState: (state, action) => {
            state.currentKycState = action.payload
        },
        setKycStatus: (state, action) => {
            state.kycStatus = action.payload
        },
        setIsSubscribed: (state, action) => {
            state.isSubscribed = action.payload
        },
        setFetchingAppMenu: (state, action) => {
            state.fetchingAppMenu = action.payload
        },
        setMenuLinks: (state, action) => {
            state.menuLinks = action.payload
        },
        setBrandLogo: (state, action) => {
            state.businessLogo = action.payload
        },
        updateTwoFactor: (state, action) => {
            state.twoFA = typeof action.payload === 'boolean'
                ? { loading: false, isEnabled: action.payload }
                : { loading: action.payload.loading, isEnabled: action.payload.isEnabled };
        },
        updateProfileImage: (state, action) => { state.details.image = action.payload },
        setReKycEnabled: (state, action) => {
            state.reKycEnabled = action.payload;
        },
        setIsKycorKybFlowEbabled: (state, action) => {
            state.isKycorKybFlowEbabled = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserDetails.pending, (state) => {
                state.userProfileLoading = true;
            })
            .addCase(fetchUserDetails.fulfilled, (state, action) => {
                const { metadata, ...details } = action.payload || { metadata: {} }
                state.sk = details.clientSecretKey
                state.details = { ...details, phoneNumber: decryptAES(details.phoneNumber, details.clientSecretKey), phoneCode: decryptAES(details?.phoneCode, details.clientSecretKey), email: decryptAES(details.email, details.clientSecretKey), role: decryptAES(details.role, details.clientSecretKey) }
                state.metadata = metadata
                state.currentKycState = details?.currentKycState
                state.kycStatus = details?.kycStatus
                state.isSubscribed = metadata?.IsSubscribed
                state.currentRole = decryptAES(details?.role, details.clientSecretKey)
                state.businessLogo = details?.brandLogo
                state.userProfileLoading = false;
            })
            .addCase(fetchUserDetails.rejected, (state, action) => {
                state.metadata = initialState.metadata
                state.currentKycState = initialState.currentKycState
                state.kycStatus = initialState.kycStatus
                state.isSubscribed = initialState.isSubscribed
                state.details = { error: action.payload }
                state.userProfileLoading = false;
            })
            .addCase(fetchCasesData.pending, (state) => {
                state.userCasesInfo.loader = true;
                state.userCasesInfo.data = null;
                state.userCasesInfo.error = '';
            })
            .addCase(fetchCasesData.fulfilled, (state, action) => {
                state.userCasesInfo.loader = false;
                state.userCasesInfo.data = action.payload;
                state.userCasesInfo.error = '';
            })
            .addCase(fetchCasesData.rejected, (state, action) => {
                state.userCasesInfo.loader = false;
                state.userCasesInfo.data = null;
                state.userCasesInfo.error = action.payload || 'Failed to fetch case data';
            })
            .addCase(getIpRegistryData.fulfilled, (state, action) => {
                state.trackAuditLogData = action.payload;
            })
            .addCase(fetchMenuLinks.pending, (state) => {
                state.fetchingAppMenu = true;
            })
            .addCase(fetchMenuLinks.fulfilled, (state, action) => {
                state.screens = action.payload;
                const { menuLinks, enabledModules } = groupMenuLinks(action.payload);
                state.enabledModules = enabledModules
                state.menuLinks = menuLinks
                state.fetchingAppMenu = false;
                state.helpEnabledScreens = action.payload
                    .filter(item => item.isHelpLink === true && item.isEnabled === true)
                    .map(item => ({
                        screenName: item.screenName,
                        isHelpLink: item.isHelpLink,
                        helpLink: item.helpLink,
                        isEnabled:item.isEnabled
                    }));
                state.isHelpLinkEnabled = action.payload.some(item => item.isHelpLink === true);
                state.helpLinkUrl = action.payload.find(item => item.isHelpLink === true)?.helpLink || '';
            })
            .addCase(fetchMenuLinks.rejected, (state) => {
                state.fetchingAppMenu = false;
            })
            .addCase(fetchScreenPermissions.pending, (state) => {
                state.permissions = null;
            })
            .addCase(fetchScreenPermissions.fulfilled, (state, action) => {
                state.permissions = action.payload;
                // state.isHelpLinkEnabled = action.payload.isHelpLinkEnabled ?? initialState.isHelpLinkEnabled;
                // state.helpLinkUrl = action.payload.helpLinkUrl ?? initialState.helpLinkUrl;
            })
            .addCase(fetchVerifications.pending, (state) => {
                state.verifications.loading = true;
                state.verifications.error = '';
            })
            .addCase(fetchVerifications.fulfilled, (state, action) => {
                state.verifications.loading = false;
                state.verifications.error = '';
                state.verifications.hasVerifications = action.payload;
            })
            .addCase(fetchVerifications.rejected, (state, action) => {
                state.verifications.loading = false;
                state.verifications.error = action.payload;
            })

            .addCase(fetchNoticesData.pending, (state) => {
                state.noticeInfo.loader = true;
                state.noticeInfo.data = null;
                state.noticeInfo.error = '';
            })
            .addCase(fetchNoticesData.fulfilled, (state, action) => {
                state.noticeInfo.loader = false;
                state.noticeInfo.data = action.payload;
                state.noticeInfo.error = '';
            })
            .addCase(fetchNoticesData.rejected, (state, action) => {
                state.noticeInfo.loader = false;
                state.noticeInfo.data = null;
                state.noticeInfo.error = action.payload || 'Failed to fetch notices';
            })
    },
});

export const { clearUserInfo, setMetadata, updateDocRequest, updateTwoFactor, setCurrentScreen, setPermissions, setScreens, setEnabledModules, setCurrentKycState, setKycStatus, setFetchingAppMenu, updateProfileImage, setIsSubscribed, setCurrentRole, setBrandLogo, setMenuLinks,
    setReKycEnabled, setIsKycorKybFlowEbabled
} = userSlice.actions;
export default userSlice.reducer;
