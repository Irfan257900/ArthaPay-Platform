import React, { memo } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
const CryptoServices = () => {
    const { t } = useTranslation();
    const enabledModules = useSelector(
        (state) => state.userConfig.enabledModules
      );
    const services = [
        {
            icon: "db-vault-icon",
            title: t('dashboard.Vaults'),
            route:'/vaults',
            description: t('dashboard.Secure crypto vaults to protect your digital assets.'),
        },
         {
            icon: "db-exchange-icon",
            title: t('dashboard.Exchange'),
            route:'/exchange',
            description:t('dashboard.Trade_crypto_securely_in_real-time.'),
        },
        {
            icon: "db-banks-icon",
            title: t('dashboard.Banks'),
            route:'/banks',
            description:t('dashboard.Manage_bank_accounts_deposits_and_withdrawals.'),
        },
       
        {
            icon: "db-card-icon",
            title: t('dashboard.Cards'),
            route:'/cards',
            description:t('dashboard.Crypto cards for effortless spending, anytime, anywhere.'),
        },
        {
            icon: "db-payin-icon",
            title: t('dashboard.Payments'),
            route:'/payments',
            description:t('dashboard.Payments_Desc'),
        },
    ].filter((service) => enabledModules.includes(service.title));
    return (
        <>
            {services.map((service) => (
                <Link
                    key={service.id}
                    to={service.route}
                    className="p-3.5 border border-dbkpiStroke hover:border-primaryColor active-hyperlink hover:bg-primaryColor hoveranim rounded-5 "
                >
                    <div >
                        <span className={`icon ${service.icon}`}></span>
                        <h4 className="text-dbkpiText text-base font-semibold">{service.title}</h4>
                        <p className="text-labelGrey text-sm font-light self-end">{service.description}</p>
                    </div>
                </Link>
            ))}</>);
};

export default memo(CryptoServices);