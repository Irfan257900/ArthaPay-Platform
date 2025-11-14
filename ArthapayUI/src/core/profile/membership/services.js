export const purchaseTexts={
    upgradeButtonText:'Purchase',
    upgradeDrawerTitle:'Purchase Membership',
    requestSubmittedText:'Membership purchase request submitted successfully',
    upgradeBenefitsDescription:'Purchase a membership and start enjoying the benefits today.'
}
export const upgradeTexts={
    upgradeButtonText:'Upgrade',
    upgradeDrawerTitle:'Upgrade Membership',
    requestSubmittedText:'Membership upgrade request submitted successfully',
    upgradeBenefitsDescription:'Upgrade your membership to enjoy greater savings as you progress to higher levels.'
}
export const membershipUpgradeTexts=(key,isSubscribed)=>{
    return isSubscribed  ? upgradeTexts[key]:purchaseTexts[key]
}

