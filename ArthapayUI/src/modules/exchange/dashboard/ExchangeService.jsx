import {useMemo} from "react";
import { useTranslation } from "react-i18next";
import FeatureCard from "../../../core/shared/FeatureCards";
const ExchangeServices = () => {
  const { t } = useTranslation();
  const services = useMemo(()=>{
    return [
        {
          icon: "icon db-buy-icon",
          title: "Buy",
          description: t("dashboard.Buy_tag_line"),
          route: "/exchange/buy",
        },
        {
          icon: "icon db-sell-icon",
          title: "Sell",
          description: t("dashboard.Sell_tag_line"),
          route: "/exchange/sell",
        },
      ]
  },[t]);
  return (
    <>
      {services.map((service, index) => (
        <div className="p-3.5 border border-dbkpiStroke hover:border-primaryColor active-hyperlink hover:bg-primaryColor hoveranim rounded-5 " key={service.title}>
        <FeatureCard
        key={service.title}
          icon={service.icon}
          title={service.title}
          description={service.description}
          hasSeparator={index > 0 || index < services?.length}
          routing={service.route}
        /> </div>))}        
    </>
  );
};

export default ExchangeServices;
