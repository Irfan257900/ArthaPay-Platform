import React, { useMemo } from 'react'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
const PayeeActions = ({ status, handlePayeeEdit, handleModalActions, activeTab,selectedPayee }) => {
  const { type } = useParams();
  const permissions = useSelector((state) => state.userConfig.permissions?.permissions);
  const payeeDetails = useSelector((state)=>state?.payeeStore?.payeeDetails);
  // Find the current tab object
  const currentTab = permissions?.tabs?.find(tab => tab.name === activeTab);
  // Get enabled actions for the current tab
  const tabActions = useMemo(() => {
    return currentTab?.actions?.filter(action => action.isEnabled) || [];
  }, [currentTab]);
  const actionHandlers = {
    Edit: handlePayeeEdit,
    ToggleStatus: () => handleModalActions(true),
  };
  const filteredActions = tabActions.filter(action =>
    action.name !== 'View' &&
    action.name !== 'Add' &&
    action.name !== 'Disable'
  );
  const hasToggleAction = tabActions.some(action => action.name === 'Disable');
  const toggleLabel = status === 'Active' ? 'Disable' : 'Enable';
  const toggleIcon = 'disable';
  return (
    <div className="text-right addon-icon flex justify-end items-center px-4 gap-4">
      {/* Render Edit and other filtered actions */}
      {filteredActions.map(action => (
        <div className='text-center' key={action.name}>
          {(type === 'fiat' ? payeeDetails?.isEditable : true) && 
          <>
          <div>
            <button
              className="cursor-pointer border-none p-0 outline-none mx-auto"
              onClick={actionHandlers[action.name]}
              aria-label={action.name}
              disabled={!actionHandlers[action.name]}
            >
              <span className={`icon ${action.icon}`}></span>
            </button>
          </div>
          <p className="text-center text-xs font-semibold text-textGrey">
            {action.name}
          </p>
          </>
          }
        </div>
      ))}
      {/* Always show Enable/Disable toggle if permission exists */}
      {hasToggleAction && (
        <div className='text-center' key="ToggleStatus">
          <div>
            <button
              className="cursor-pointer border-none p-0 outline-none mx-auto"
              onClick={actionHandlers.ToggleStatus}
              aria-label={toggleLabel}
            >
              <span className={`icon ${toggleIcon}`}></span>
            </button>
          </div>
          <p className="text-center text-xs font-semibold text-textGrey">
            {toggleLabel}
          </p>
        </div>
      )}
    </div>
  )
}

export default PayeeActions