import React from 'react'
import AppDefaults from '../../../utils/app.config'
import NumericText from '../../../core/shared/numericText'

const DetailsViewHeader = ({hasData,data}) => {
  return (
    <div className="md:flex items-center justify-between border-b-2 border-cryptoline pb-2 sell-header p-0 mb-0">
                {hasData && (
                  <div className="flex mobile-flex gap-2.5">
                    <div className="">
                      <span className="name-rounded">
                        {data?.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left currency-panel mobile-margin">
                      <h2 className="text-xl text-titleColor font-semibold">
                        {data?.name}
                      </h2>
                        <NumericText className="font-semibold text-subTextColor" 
                        value={data?.amount} 
                        suffixText={data?.cardcurrency||data?.cardCurrency} 
                        decimalScale={AppDefaults.fiatDecimals} />
                    </div>
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-xl text-subTextColor">
                    My Cards
                  </h2>
                </div>
              </div>
  )
}

export default DetailsViewHeader