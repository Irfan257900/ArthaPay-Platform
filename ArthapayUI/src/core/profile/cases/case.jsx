import React, { useCallback, useEffect, useMemo, useReducer } from 'react'
import { Collapse, Form, Alert } from "antd";
import Info from './info';
import { initialState, caseReducer } from './reducer';
import { getCaseDetails, getMessageReplies } from './httpServices';
import PropTypes from 'prop-types';
import AccordionContent from './accordianContent';
import CustomButton from '../../button/button';
import { useNavigate, useParams } from 'react-router';
import { CaseAcordinLoader, CaseLoaders } from '../../skeleton/case.loaders';
import { textStatusColors } from '../../../utils/statusColors';
import PageHeader from '../../shared/page.header';
import { useTranslation } from 'react-i18next';
const { Panel } = Collapse;
function Case(props) {
    const [state, dispatch] = useReducer(caseReducer, initialState);
    const { id, caseNumber } = useParams();
    const navigate = useNavigate()
    const { t } = useTranslation();
    const {
        error,
        loader,
        caseData,
        messages,
        activeKey,
        loadingKeys,
        documentErrors
    } = state;
    const navigateToDashboard = () => {
        navigate(`/support`)
    }



    const breadCrumbList = useMemo(() => {
        const defaultList = [
            { id: "1", title: `Support`, handleClick: () => navigateToDashboard() },
            { id: "2", title: `View` },
        ];
        let list = [...defaultList];
        if (caseNumber) {
            list = [
                ...list,
                { id: "3", title: caseNumber }
            ];
        }
        return list;
    }, [caseNumber, t]);
    useEffect(() => {
        if (id)
            getViewDetails()
    }, [])

    async function getViewDetails() {
        await getCaseDetails(dispatch, id);
    }
    const handleBack = useCallback(() => {
        navigate(`/support`)
    }, []);
    const handleCollapseChange = useCallback(async (key) => {
        dispatch({ type: 'SET_ACTIVE_KEY', payload: key });
        const newlyOpenedKeys = key.filter((k) => !activeKey.includes(k));
        if (newlyOpenedKeys.length > 0) {
            const newKey = newlyOpenedKeys[0];
            await getMessageReplies(dispatch, newKey);
        }
    }, [activeKey]);
    const clearErrorMsg = useCallback(() => {
        dispatch({ type: 'SET_ERROR', payload: null });
    }, []);
    return (
        <div className='w-full mb-5'>
            <PageHeader breadcrumbList={breadCrumbList} />
            <div className='flex justify-end mb-3'>
                <span class="icon lg close cursor-pointer" title="close" onClick={handleBack}></span>
            </div>
            {error && (
                <Alert
                    type="error"
                    description={error}
                    onClose={clearErrorMsg}
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
                                    key={doc.id}
                                    className={` mb-8 !rounded-md  ${messages?.length > 0 ? "custom-scroll" : "custome-collapse-bg-nodata"} `}
                                    header={
                                        <div className="flex flex-1 justify-between items-center">
                                            <h3 className="accordian-heading text-base accordian-heading-line m-0">
                                                {doc.documentName}
                                            </h3>
                                            <h3 className={`${textStatusColors[doc.state]} m-0 text-xs bg-white rounded-full py-0.5 px-2`}>{doc.state}</h3>
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