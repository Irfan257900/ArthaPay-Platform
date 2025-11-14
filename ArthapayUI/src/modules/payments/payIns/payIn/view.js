import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router';
import useApi from '../../../../utils/useApi';
import UpdateDueDate from './updateDueDate';
import StaticView from './static.view';
import InvoiceView from './invoice.view';
import { actionStatusList, statusWarningTexts } from '../payin.constants';
import { getLinkDetails } from '../../httpServices';
import ContentLoader from '../../../../core/skeleton/common.page.loader/content.loader';
import darknoData from '../../../../assets/images/dark-no-data.svg';
import lightnoData from '../../../../assets/images/light-no-data.svg';
import { useSelector } from 'react-redux';
import { Dropdown, Spin, Tooltip } from 'antd';
import { LoadingOutlined } from "@ant-design/icons"
import ActionController from '../../../../core/onboarding/action.controller';
import AppEmpty from '../../../../core/shared/appEmpty';
const View = () => {
  const { id, type } = useParams()
  const { awaitingResponse, data, error, handleApi } = useApi(false)
  const [modalOpen, setModalOpen] = useState('')
  const [warning, setWarning] = useState('')
  const errorRef = useRef(null)
  const navigate = useNavigate();
  const { setPayinViewDetails, handleAction, loaderDwnd, menu } = useOutletContext();
  const tabs = useSelector((state) => state?.userConfig?.permissions?.permissions?.tabs);
  const permissions = tabs?.filter((item) => item?.name === 'Pay In');

  useEffect(() => {
    if (id != "undefined") {
      handleApi(getLinkDetails, null, null, true, [id, type], 'onlyData')
    }
  }, [id, type]);

  useEffect(() => {
    if (data) {
      setPayinViewDetails(data);
    }
  }, [data])

  useEffect(() => {
    (error || warning) && errorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [error || warning])
  const onUpdateDueDate = useCallback(() => {
    const status = data?.status?.toLowerCase()
    if (actionStatusList['update']?.includes(status)) {
      setWarning(statusWarningTexts('update')[status])
      return
    }
    setModalOpen('dueDate')
  }, [data])

  const onUpdateDateSuccess = useCallback(() => {
    setModalOpen('')
    handleApi(getLinkDetails, null, null, true, [id, type], 'onlyData')
  }, [id, type, getLinkDetails]);

  const updateModelOpen = useCallback(() => {
    setModalOpen('');
  }, []);

  return (
    <>
      {data?.renderedTemplate && <div className="flex justify-end text-right gap-3 mt-5 w-full">
        {permissions?.[0]?.actions &&
          permissions?.[0]?.actions
            .filter((action) => action.isEnabled && !["View", "Add"].includes(action.name))
            .map((action, index) => {
              const isLastAction = permissions?.[0].actions.length >= 2 && index === permissions?.actions?.length - 1;
              return (
                <>
                  {action.name !== 'Share' && (
                    <div key={action.name} className="text-center max-w-14">
                      <Tooltip title={action.name} placement={isLastAction ? "left" : "top"}>
                        <ActionController
                          handlerType="button"
                          actionParams={[action?.name]}
                          onAction={handleAction}
                          redirectTo='/payments/payins'
                          actionFrom="Payments"
                          buttonType="plain"
                          buttonClass={'cursor-pointer border-none p-0 outline-none mx-auto'}
                          disabled={loaderDwnd}
                        >
                          <span
                            className={`icon ${action.icon}`}
                            style={{
                              pointerEvents: loaderDwnd && action.name === 'Download' ? 'none' : 'auto',
                              display: 'inline-block',
                              position: 'relative',
                            }}
                          >
                            {loaderDwnd && action?.name === 'Download' ? (
                              <Spin
                                indicator={<LoadingOutlined spin />}
                                style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                }}
                              />
                            ) : (
                              <span className={`icon ${action.icon}`} style={{ visibility: loaderDwnd ? 'hidden' : 'visible' }} />
                            )}
                          </span>

                        </ActionController>
                        <p className={`text-center text-xs font-medium text-textGrey mt-1`}>{action.tooltipTitle}</p>
                      </Tooltip>
                    </div>
                  )}
                  {action?.name === 'Share' && (
                    <Dropdown placement="topRight" overlay={menu} trigger={['hover']} className="" overlayClassName="">
                      <div className="flex items-start">
                        <div className="cursor-pointer">
                          <span className={`icon ${action.icon}`}></span>
                        </div>
                      </div>
                    </Dropdown>
                  )}
                </>
              );
            })}
      </div>}
      {(!data && !awaitingResponse) && <div className='nodata-content loader-position'>
        <AppEmpty description={`It Looks like you dont have any invoices yet. Let's genarate one to get started .`} >
          <button
            type="button"
            className="cards secondary-outline !px-6 !py-2 !text-base "
            onClick={() => navigate('/payments/payins/payin/00000000-0000-0000-0000-000000000000/new/generate/PaymentLink/crypto')}
          >
            Genarate Payment Link
            <span className="icon btn-arrow ml-2"></span>
          </button>
        </AppEmpty>
      </div>}
      {(awaitingResponse) && <div className='text-center'><ContentLoader /></div>}
      <div ref={errorRef}>
      </div>
      {!awaitingResponse && data && type === 'PaymentLink' && <StaticView data={data.renderedTemplate} onUpdateDueDate={onUpdateDueDate} selectedPayin={data} />}
      {!awaitingResponse && type === 'Invoice' && data && <InvoiceView data={data.renderedTemplate} onUpdateDueDate={onUpdateDueDate} isPreview={false} selectedPayin={data} />}
      {modalOpen === 'dueDate' && <UpdateDueDate isModalOpen={modalOpen === 'dueDate'} onCancel={updateModelOpen} onSuccess={onUpdateDateSuccess} linkDetails={data} />}
    </>
  )
}

export default View