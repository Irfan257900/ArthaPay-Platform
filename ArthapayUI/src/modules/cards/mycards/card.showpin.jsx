import { Alert, Form } from "antd";
import { useEffect, useReducer } from "react";
import { connect } from "react-redux";
import { getShowPin } from "../httpServices";
import SideDrawerLoader from "../../../core/skeleton/drawer.loaders/sidedrawer.loader";
import { showPinreducer, showPinState } from "./card.reducer";
import { useTranslation } from "react-i18next";

const ShowPin = ({ user, cardDetails }) => {
    const [form] = Form.useForm();
    const [localState, localDispatch] = useReducer(showPinreducer, showPinState);
    const { t } = useTranslation();
    useEffect(() => {
        showPinData()
    }, [])

    const showPinData = async () => {
        try {
            localDispatch({ type: 'setLoader', payload: true });
            let obj = {
                cardId: cardDetails?.id,
            };
            const urlParams = {obj:obj}
            await getShowPin(localDispatch,urlParams);
        } catch (error) {
            localDispatch({ type: 'setErrorMsg', payload: error });
        } finally {
            localDispatch({ type: 'setLoader', payload: false });
        }
    };
    
    return (
            <>
                <div></div>
                <Form form={form} className='terminate modal-wcontent'>
                    <>
                        {localState?.loader && <SideDrawerLoader/>}
                        {localState?.errorMsg && (
                            <div className="alert-flex mb-24">
                                <Alert
                                    type="error"
                                    description={localState?.errorMsg}
                                />
                                <span className="icon sm alert-close" onClick={()=>localDispatch({ type: 'setErrorMsg', payload: null }) }></span>
                            </div>
                        )}
                        {!localState?.loader && <>
                            {localState?.getPin?.pin && <div className='summary-list-item summaryList-total mb-3 w-100 !pl-0'>
                                <p className='note-text m-0'> {t('cards.showPin.pin')} :
                                    <strong className='text-lightWhite'>{" "}{localState?.getPin?.pin}</strong></p>
                            </div>}
                        </>}                       
                    </>
                </Form>
            </>
    )
}
const connectStateToProps = ({ userConfig }) => {
    return {
        user: userConfig.details,
        trackauditlogs: userConfig?.trackAuditLogData,
    }
}
export default connect(connectStateToProps)(ShowPin)