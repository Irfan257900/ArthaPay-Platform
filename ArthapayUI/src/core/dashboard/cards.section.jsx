import React, { useCallback, useEffect, useReducer } from "react";
import { fetchUserCards } from "./http.services";
import { initialState, reducer } from "./reducer";
import { badgeColor, badgeStyle } from '../../modules/cards/service';
import { Link, useNavigate } from "react-router";
import ActionController from "../onboarding/action.controller";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import NumericText from "../shared/numericText";
const CardSection = () => {
    const navigate = useNavigate();
    const [localState, localDispatch] = useReducer(reducer, initialState);
    const userinfo = useSelector(state => state.userConfig.details)
    const { t } = useTranslation();
    useEffect(() => { getAllCards() }, []);
    const setGetCardsData = (response) => {
        if (response) {
            localDispatch({ type: 'setCardsData', payload: response });
        }
    }
    const getAllCards = async () => {
        const urlParams = { pageSize: 2, pageNo: 1, isBussines: userinfo?.accountType === "Business" }
        await fetchUserCards(localDispatch, setGetCardsData, urlParams);
    }
    const handleApplyNow = useCallback(() => {
        navigate('/cards/apply')
    }, []);
    return (<>
        <div className="flex items-center justify-between mb-4 mt-7">
            <h4 className="bashboard-titles">My Cards</h4>
            {localState?.cardsData?.length > 0 && <div>
                <button type="normal" className="secondary-outline" onClick={() => navigate(`/cards/mycards`)}>All Cards  <span className="icon btn-arrow shrink-0 ml-2"></span></button>
            </div>}
        </div>
        {localState?.cardsData?.length === 0 && (
            <div className='kpicardbg'>
                <div className="md:flex items-center justify-between md:space-y-0 space-y-4">

                    {/* 1. SVG Icon on the left */}
                    <div className="flex-shrink-0 flex items-center justify-center md:!block p-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            // Kept original classes for size and color.
                            className="h-24 w-24 text-paraColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z"
                            />
                        </svg>
                    </div>

                    {/* 2. Text content in the middle */}
                    {/* Kept original font and color classes. */}
                    <div className="md:flex flex-grow items-center justify-between md:space-y-0 space-y-4 md:p-6">
                        <div className="mx-6">
                            {/* <h3 className='text-lg font-medium text-lightWhite'>
                            {t('cards.Don’t miss out on exclusive card benefits!')}
                        </h3> */}
                            <p className="text-base font-light text-lightWhite">
                                {` It looks like you don't have any cards yet.
                            Let's apply one to get started!`}
                            </p>
                        </div>

                        {/* 3. ActionController button on the right */}
                        {/* Replaced the simple button with the ActionController component. */}
                        <div className="flex-shrink-0 custom-controller">
                            <ActionController
                                handlerType="button"
                                onAction={handleApplyNow}
                                actionFrom="Cards"
                                redirectTo={`/cards`}
                                buttonType="noraml"
                                className={''}
                            >
                                {t('cards.APPLY FOR CARD')}
                            </ActionController>
                        </div>
                    </div>
                </div>
            </div >
        )}
        {
            localState?.cardsData?.length > 0 && <div className="grid grid-cols-1 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 xl:gap-y-7 lg:gap-x-3 lg:gap-y-5 gap-4">
                {(
                    localState.cardsData.map((item) => (
                        <Link className="carosal-card !p-0 cursor-pointer" key={item.id} to={`/cards/mycards/My%20Cards/${item.id}`}>
                            <img src={item.image || item.logo} alt="" className="rounded-5 !w-full !h-full" />
                            <div className="mb-4 absolute top-0 left-0 h-full w-full xl:p-4 lg:p-3 p-4 flex flex-col justify-between">
                                <div className="flex items-start justify-between">
                                    <h4 className="db-card-title xl:text-xl lg:!text-base">{item?.cardName}</h4>
                                    {item?.status && <div className="text-right">
                                        <p className="card-state-default ml-auto xl:text-[11px] lg:text-[9px] flex items-center text-center  break-words whitespace-pre-line !rounded-[100px]" style={{ backgroundColor: badgeStyle[item?.status?.toLowerCase()] || 'rgb(3, 122, 0)', color: badgeColor[item?.status?.toLowerCase()] || 'rgb(255, 255, 255)' }}>
                                            {item?.status === 'Approved' ? 'Active' : item?.status}
                                        </p>
                                    </div>}
                                </div>
                                <div>
                                    <p className="db-card-title mb-0">
                                        {`${item?.number?.substr(0, 4) || "XXXX"} XXXX XXXX ${item?.number?.substr(-4) || "XXXX"}`}
                                    </p>
                                </div>
                                <div>
                                    <p className="db-card-title !capitalize">{item?.customerName}</p>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <h5 className="text-[10px] font-normal dark:text-subTextColor !text-textWhite">Current balance</h5>
                                        <h2 className="text-[10px] font-semibold m-0 dark:text-subTextColor !text-textWhite">
                                            <NumericText value={item?.amount}  type="text" decimalScale={2} fixedDecimalScale={true} thousandSeparator={true} allowNegative={true} className="amount-text text-xs font-semibold text-textWhite" /> <span>{item?.currency}</span>
                                        </h2>
                                    </div>
                                    <h2 className="xl:text-sm lg:text-xs font-semibold m-0 dark:text-subTextColor !text-textWhite">**/**</h2>
                                    <h2 className="xl:text-sm lg:text-xs font-semibold m-0 text-textWhite">***</h2>
                                    {/* <img src={item?.assoc}alt=" " className="w-16" /> */}
                                    <p className='text-textWhite xl:text-2xl lg:text-xl font-semibold '>{item?.assoc || 'VISA'} </p>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        }

    </>)
}

export default CardSection;