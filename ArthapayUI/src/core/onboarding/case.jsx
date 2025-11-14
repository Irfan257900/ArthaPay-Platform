import React, { useCallback, useEffect, useReducer } from 'react'
import { Collapse, Form, Alert } from "antd";
import { useNavigate } from 'react-router';
import PropTypes from 'prop-types';
import CustomButton from '../button/button';
import Info from '../profile/cases/info';
import { initialState, caseReducer } from '../profile/cases/reducer';
import { getCaseDetails, getMessageReplies } from '../profile/cases/httpServices';
import AccordionContent from '../profile/cases/accordianContent';
import { CaseAcordinLoader, CaseLoaders } from '../skeleton/case.loaders';
import { textStatusColors } from '../../utils/statusColors';

const { Panel } = Collapse;
function Case({id,onBack}) {
    const [state, dispatch] = useReducer(caseReducer, initialState);
    const navigate = useNavigate()
    const {
        error,
        loader,
        caseData,
        messages,
        activeKey,
        loadingKeys,
        documentErrors
    } = state;

    useEffect(() => {
        if (id)
        getViewDetails()
    }, [])

    async function getViewDetails() {
        await getCaseDetails(dispatch,id);
    }
    const handleBack = useCallback(() => {
        if (onBack) {
            onBack();
        } else {
            navigate(`/support`);
        }
    }, [onBack]);
    const handleCollapseChange = useCallback(async (key) => {
        dispatch({ type: 'SET_ACTIVE_KEY', payload: key });
        const newlyOpenedKeys = key.filter((k) => !activeKey.includes(k));
        if (newlyOpenedKeys.length > 0) {
            const newKey = newlyOpenedKeys[0];
            await getMessageReplies(dispatch,newKey);
        }
    },[activeKey]);
    const clearErrorMsg = useCallback(()=>{
        dispatch({ type: 'SET_ERROR', payload: null });
    },[]);
    return (
        <div className='w-full mb-5'>
            <div className='flex justify-end mb-3'>
               <span class="icon lg close cursor-pointer" title="close" onClick={handleBack}></span>
            </div>
            {error && (
                <Alert
                    type="error"
                    description={error}
                    onClose={clearErrorMsg }
                    showIcon
                />
            )}
            {loader && <CaseLoaders />}
            {!loader && <div>
                <div className="kpicardbg md:p-4 p-2 mb-5">
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4' >
                        <div>
                            <div className="">

                                <label className="mb-0 profile-label">Case Number</label>
                                <p className="mb-0 profile-value"> {caseData?.number}</p>
                            </div>
                        </div>
                        <div>
                            <div className="">
                                <label className="mb-0 profile-label">Case Title</label>
                                <p className="mb-0 profile-value">{caseData?.title}</p>
                            </div>
                        </div>
                        <div>
                            <div className="">
                                <label className="mb-0 profile-label">Case State</label>
                                <p className="mb-0 profile-value status-color"> {caseData?.state}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="kpicardbg md:p-4 p-2 mb-5 ">
                    <Info caseDetails={caseData} />
                </div>
                <div className="kpicardbg md:p-4 p-2 mb-5">
                    <Form.Item name="remarks" className="!mb-0">

                        <div className="">
                            <label className="mb-0 profile-label">Case Remarks</label>
                            <p className="mb-0 profile-value"> {caseData?.remarks}</p>
                        </div>

                    </Form.Item>
                </div>
                <Collapse accordion className='custom-collapse custome-collapse-bg dashboard-collapse' activeKey={activeKey} onChange={handleCollapseChange}>
                    {caseData?.details?.map((doc) => {
                        if (doc.isChecked) {
                            return (
                                <Panel
                                className=' mb-8 !rounded-md'
                                    key={doc.id}
                                    header={
                                        <div className="flex flex-1 justify-between items-center">
                                            <h3 className="accordian-heading text-base accordian-heading-line m-0">
                                                {doc.documentName}
                                            </h3>
                                            <h3 className={`${textStatusColors[doc.state]} m-0 text-lg`}>{doc.state}</h3>
                                        </div>
                                    }
                                >
                                    {loadingKeys[doc.id] ? (
                                        <div className="loading-container">
                                            <CaseAcordinLoader />
                                        </div>
                                    ) : (
                                        <>
                                            {documentErrors[doc.id] && (
                                                <Alert
                                                    className="mb-12 security-error"
                                                    description={documentErrors[doc.id]}
                                                    closable
                                                />
                                            )}
                                            <AccordionContent initialMessages={messages} docDetails={doc} caseData={caseData} />
                                        </>
                                    )}
                                </Panel>
                            );
                        }
                        return null;
                    })}
                </Collapse>

            </div>}
            <div className="back-button-container mb-6 flex justify-end">
                <CustomButton
                    type="primary"
                    onClick={handleBack} className='btn-transaparent'
                >
                    Back
                </CustomButton>
            </div>
            </div>
    )
}
Case.propTypes = {
    history: PropTypes.shape({
        push: PropTypes.func.isRequired
    }).isRequired
};
export default Case