import { ApiControllers } from "../../../api/config";

////Dashboards---------------------------------------------------------------------------------------------------/

export const common={
    valuts:`${ApiControllers.merchant}Wallets`,
    advertisment: `${ApiControllers.dashboard}GetAdvertisements`

    }

    export const Dashboardfiat={
        fiat:`${ApiControllers.dashboard}Wallets/Fiat`

    }

export const transcations={
    walletrecenttranscation:`${ApiControllers.merchant}transactions`
}


export const kips={
    dashBoardkips:`${ApiControllers.dashboard}Vaults/CustomerBalances`
}

export const valutNetwork={
    ValutNetworkLU:`Vaults`
}

export const walletsAddress={
    address:`${ApiControllers.exchangeWallets}Vaults/DepositCrypto/Exchange`

}
export const cryptoWalletsAddress={
    address:`${ApiControllers.exchangeWallets}Vaults/WithdrawCrypto/Exchange`

}
export const getAssets={
    cryptoAssets:`${ApiControllers.merchant}/GetShowByAssest`
}


export const getFiatAssets={
    fiatAssets:`${ApiControllers.merchant}Vaults/Fiat`
}

export const getbalance={
    gettotalBalance:`${ApiControllers.merchant}/availablebalance/BTC`
}



///------------------------------------------------------------------------------------------------------------