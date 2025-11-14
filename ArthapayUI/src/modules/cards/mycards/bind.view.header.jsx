import React, { useCallback } from 'react'
import CustomButton from '../../../core/button/button'
import { useNavigate, useParams } from 'react-router'
import NumericText from '../../../core/shared/numericText'
import AppDefaults from '../../../utils/app.config'

const BindViewHeader = ({ hasData, data, showBack }) => {
  const { tabName, cardId } = useParams()
  const navigate = useNavigate()
  const handleBack = useCallback(() => {
    navigate(`/cards/mycards/${tabName}/${cardId}`)
  }, [tabName, cardId])
  return (
    <div className="md:flex items-center justify-between border-b-2 border-cryptoline pb-2 sell-header p-0 mb-0">

      {hasData && (
        <div className="flex mobile-flex gap-2.5">
          {showBack && <CustomButton type="normal" onClick={handleBack} className='cursor-pointer ml-6'><span className="icon lg btn-arrow-back"></span></CustomButton>}
          <div className="">
            <span className="name-rounded">
              {(data?.cardName || data?.name)
                ?.charAt(0)
                ?.toUpperCase()}
            </span>
          </div>
          <div className="text-left currency-panel mobile-margin">
            <h2 className="text-xl text-titleColor font-semibold">
              {data?.cardName || data?.name}
            </h2>
            <h3 className="panel-subhead">
              <NumericText className="font-semibold text-subTextColor"
                value={data?.amount || 0}
                decimalScale={AppDefaults.fiatDecimals}
                prefixText={data?.cardcurrency}
              />
            </h3>
          </div>
        </div>
      )}
      <div>
        <h2 className="font-semibold text-xl text-subTextColor">
          Bind Card
        </h2>
      </div>
    </div>
  )
}

export default BindViewHeader