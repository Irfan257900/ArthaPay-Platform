import React from "react";
import redgraph from '../../assets/images/red-graph.png';
import featuredasset from '../../assets/images/featured-asset.png';
import AppNumber from "../shared/inputs/appNumber";
import PropTypes from "prop-types"; 
import SparklineGraph from "./sparkline";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
const MarketHighlightsKpis = ({ topgainerData, percentageClassName = ["text-textGreen text-xs font-semibold", "text-textRed text-xs font-semibol"], graphImgColorClassList = ["icon graph-green ml-1", "icon graph-red ml-1"], graphColorClassList = [featuredasset, redgraph] }) => {
    const { t } = useTranslation();
    const getSymbolPercentage = (symbol) => {
        const percentages = {
          btc: "4%",
          eth: "11%",
          xrp: "17.5%",
        };
        return percentages[symbol] ;
      };
    return (
        topgainerData?.map((data, index) => (
            <div key={data.id}>
                <Link to={`/dashboard/${data?.name}/${data?.id}`}><div className="p-3.5 border border-dbkpiStroke rounded-5 grid md:grid-cols-2 hover:bg-kpcardhover cursor-pointer">
                    <div className="flex items-center justify-between md:col-span-2">
                        <div className="flex gap-2.5">
                            <img src={data.image} alt={data.name} className="w-8 h-8 rounded-full" />
                            <div>
                                <h4 className="text-base text-dbkpiText font-semibold">{data.name}</h4>
                                <p className="text-sm text-labelGrey ">{data.symbol.toUpperCase()}</p>
                            </div>
                        </div>
                        <SparklineGraph data={data.sparkline_in_7d.price} color={"green"} /> 
                    </div>
                    <div className="flex items-center gap-1 justify-between md:col-span-2 self-end mt-9 md:mt-5">
                        <div className="flex items-center gap-1">
                            <h3 className="text-md font-semibold text-dbkpiText">
                                <AppNumber
                                    className={"text-md font-semibold text-dbkpiTex"}
                                    type="text"
                                    defaultValue={data.current_price}
                                    localCurrency={""}
                                    prefixText={"$"}
                                    suffixText={''}
                                    thousandSeparator={true}
                                    allowNegative={true}
                                />
                            </h3>
                        </div>
                        <div>
                            <span className={graphImgColorClassList[index % 2]}></span>
                            <span className={percentageClassName[index % 2]}>
                            {getSymbolPercentage(data.symbol)}
                            </span>{' '}
                            <span className="text-labelGrey text-xs font-normal">{t('dashboard.This Week')}</span>
                        </div>
                    </div>
                </div></Link>
            </div>
        ))
    )
}
MarketHighlightsKpis.propTypes = {
    topgainerData: PropTypes.arrayOf(
        PropTypes.shape({
            image: PropTypes.string,
            name: PropTypes.string,
            symbol: PropTypes.string,
            current_price: PropTypes.number,
        })
    ),
    percentageClassName: PropTypes.arrayOf(PropTypes.string),
    graphImgColorClassList: PropTypes.arrayOf(PropTypes.string),
    graphColorClassList: PropTypes.arrayOf(PropTypes.string),
};
export default MarketHighlightsKpis;