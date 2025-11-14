// src/components/UbosOrDirectorsGrid.jsx
import React, { useCallback, useState, useEffect } from 'react';
import { Tooltip } from "antd";
import CommonDrawer from '../../../core/shared/drawer';
import UBODrawerForm from './ubo.director.form';
import { useDispatch, useSelector } from 'react-redux';
import { decryptAES } from '../../../core/shared/encrypt.decrypt';
import { resetState, setDirectorBenficiaries, setUboBenficiaries } from '../../../reducers/banks.reducer';
import CustomButton from '../../../core/button/button';
import moment from 'moment';

const UbosOrDirectorsGrid = ({ setSelectionError, apiData }) => {
const dispatch = useDispatch();
const Ubo = useSelector((store) => store.banks.uboBenficiaries);
const DirectorDetails = useSelector((store) => store.banks.directorBeneficiaries);
    const [items, setItems] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [currentEditingItem, setCurrentEditingItem] = useState(null);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    useEffect(() => {
        if (apiData && Ubo?.length === 0 && DirectorDetails?.length === 0) {
            const initialItems = [];
            if (apiData.ubo) {
                initialItems.push({ ...apiData.ubo, recordStatus: 'Modified' });
            }
            if (apiData.director) {
                initialItems.push({ ...apiData.director, recordStatus: 'Modified' });
            }
            
            const uboRecords = initialItems.filter(item => item.uboPosition === 'Ubo');
            const directorRecords = initialItems.filter(item => item.uboPosition === 'Director');
            
            dispatch(setUboBenficiaries(uboRecords || []));
            dispatch(setDirectorBenficiaries(directorRecords || []));
        }
    }, [dispatch]);

    useEffect(() => {
        const allItems = [...(Ubo || []), ...(DirectorDetails || [])];
        setItems(allItems);
    }, [Ubo, DirectorDetails]);

    const displayedItems = items?.filter(item => item.recordStatus !== 'Deleted');
    
    const handleAddItemClick = useCallback(() => {
        setCurrentEditingItem(null); 
        setDrawerOpen(true);
        setSelectionError('');
        setSelectedItemId(null);
    }, [setSelectionError]);

    const confirmDelete = useCallback(() => {
        const updatedItems = items.map(item => 
            item.id === selectedItemId ? { ...item, recordStatus: 'Deleted' } : item
        );
        
        const activeUboRecords = updatedItems.filter(item =>
            item.uboPosition === 'Ubo' && item.recordStatus !== 'Deleted'
        );
        const activeDirectorRecords = updatedItems.filter(item =>
            item.uboPosition === 'Director' && item.recordStatus !== 'Deleted'
        );
        
        dispatch(setUboBenficiaries(activeUboRecords));
        dispatch(setDirectorBenficiaries(activeDirectorRecords));
        setItems(updatedItems);
        setSelectedItemId(null);
        setShowDeleteConfirmation(false);
    }, [selectedItemId, items, dispatch]);

    const closeDrawer = useCallback(() => {
        setDrawerOpen(false);
        setCurrentEditingItem(null);
        setSelectedItemId(null);
        setSelectionError('');
        dispatch(resetState(["uboDetails", "beneficiaries"]));
    }, [setSelectionError, dispatch]);

    const closeDeleteDrawer = useCallback(() => {
        setShowDeleteConfirmation(false);
    }, []);

    const handleItemSaved = useCallback((savedItem) => {
        let updatedItems;
        
        if (savedItem.recordStatus === 'Added') {
            updatedItems = [...items, savedItem];
        } else {
            updatedItems = items.map(item =>
                item.id === savedItem.id ? { ...savedItem, recordStatus: 'Modified' } : item
            );
        }
        setItems(updatedItems);
        closeDrawer();
        
        const uboRecords = updatedItems?.filter(item => 
            item.uboPosition === 'Ubo' && item.recordStatus !== 'Deleted'
        );
        const directorRecords = updatedItems?.filter(item => 
            item.uboPosition === 'Director' && item.recordStatus !== 'Deleted'
        );
        
        dispatch(setUboBenficiaries(uboRecords || []));
        dispatch(setDirectorBenficiaries(directorRecords || []));
        dispatch(resetState(["uboDetails", "beneficiaries"]));
    }, [items, closeDrawer, dispatch]);

    return (
        <div>
            <div className="flex gap-3 items-center mb-2 mt-6">
                <div className='flex gap-2 items-center'>
                    <h2 className="text-2xl font-semibold text-titleColor ">UBO & Director Details <span className="text-textLightRed ml-0.5">*</span></h2>
                    <Tooltip title="A minimum of 1 Director and 1 UBO is mandatory as per regulations">
                        <span className='icon bank-info'></span>
                    </Tooltip>
                </div>

                <div className='flex items-center gap-3'>
                    <CustomButton
                        type="normal"
                        onClick={handleAddItemClick}
                        className="secondary-outline h-full flex gap-2 items-center"
                    >Add <span className="icon btn-add shrink-0 ml-2 "></span></CustomButton>
                </div>
            </div>
            <div className='mb-6'>
                {displayedItems.length > 0 ? (
                    displayedItems.map((item) => (
                        <div
                            key={item.id}
                            className={`grid xl:grid-cols-5 md:grid-cols-3 bg-menuhover rounded-5 items-start  mb-2 ${item.id === selectedItemId ? 'border-2 border-textBlue' : ''}`}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="py-4 px-3.5 group mb-4 flex items-center">
                                <div>
                                    <h1 className='text-valueColor'>Name</h1>
                                    <p className='text-sm text-paraColor font-normal mt-1 !max-w-28  break-words whitespace-pre-line'>{item?.firstName || item?.lastName? `${item?.firstName || ''} ${item?.lastName || ''}`.trim(): '--'}</p>
                                </div>
                            </div>
                            <div className="py-4 px-3.5 group mb-4">
                                <h1 className='text-valueColor'>Position</h1>
                                <p className='text-sm text-paraColor font-normal mt-1 !max-w-28  break-words whitespace-pre-line'>{item.uboPosition || "--"}</p>
                            </div>
                            <div className="py-4 px-3.5 group mb-4">
                                <h1 className='text-valueColor'>Date Of Birth</h1>
                                <p className='text-sm text-paraColor font-normal mt-1 !max-w-28 break-words whitespace-pre-line'>{item.dob ? moment(item.dob).format("DD-MM-YYYY") : "--"}</p>
                            </div>
                            <div className="py-4 px-3.5 group mb-4">
                                <h1 className='text-valueColor'>Phone Number</h1>
                                <p className='text-sm text-paraColor font-normal mt-1 !max-w-28 break-words whitespace-pre-line'>
                                    {item.phoneCode && item.phoneNumber ? `${ decryptAES(item.phoneCode)} ${decryptAES(item.phoneNumber).replace(decryptAES(item.phoneCode, ''))}` : "--"}
                                </p>
                            </div>
                            <div className="py-4 px-3.5 group mb-4 gap-3 flex">
                                <span className='icon Edit-links cursor-pointer' onClick={e => {
                                    e.stopPropagation();
                                    setSelectedItemId(item.id);
                                    setSelectionError('');
                                    setCurrentEditingItem(item);
                                    setDrawerOpen(true);
                                }} />
                                {/* <span className='icon bank-delete'
                                    onClick={e => {
                                        e.stopPropagation();
                                        setSelectedItemId(item.id);
                                        setSelectionError('');
                                        setShowDeleteConfirmation(true);
                                    }} /> */}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='my-4'>
                        <h1 className='text-center text-base font-medium'>No Data</h1>
                    </div>
                )}
            </div>

            <CommonDrawer
                title={selectedItemId ? "Edit UBO / Director" : "Add UBO / Director"}
                isOpen={drawerOpen}
                onClose={closeDrawer}
            >
                <UBODrawerForm
                    onSave={handleItemSaved}
                    onCancel={closeDrawer}
                    initialItemData={currentEditingItem}
                    drawerVisible={drawerOpen}
                    existingItems={items}
                />
            </CommonDrawer>

            <CommonDrawer
                isOpen={showDeleteConfirmation}
                onClose={closeDeleteDrawer}
                title={"Confirm Delete"}
            >
                <div className="text-center py-6">
                    <p className="!text-md mb-0 !text-lightWhite font-semibold">
                        Do you really want to delete this item?
                    </p>
                </div>
                <div className="mt-9 text-right">
                    <CustomButton className={""} onClick={closeDeleteDrawer}>
                        No
                    </CustomButton>
                    <CustomButton
                        className={"md:ml-3.5"}
                        type="primary"
                        onClick={confirmDelete}
                    >
                        Yes
                    </CustomButton>
                </div>
            </CommonDrawer>
        </div>
    );
};

export default UbosOrDirectorsGrid;