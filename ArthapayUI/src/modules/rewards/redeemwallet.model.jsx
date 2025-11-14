import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Input, message, Form } from 'antd';
import usdtIcon from '../../assets/images/usdt.png';
import xpIcon from '../../assets/images/xprewards.png';
import CustomButton from '../../core/button/button';
import { getRedeemTransferData } from './httpServices';
import AppAlert from '../../core/shared/appAlert';
import Loader from '../../core/shared/loader';
import { loyaltyAppClientMethods } from '../../core/http.clients';

// --- Hook ---
const useRedemption = (id, externalSetError) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const clearState = () => {
    externalSetError(null);
    setSuccess(null);
  };

  const processRedemption = async ({ mode, amount, destinationAddress }) => {
    setLoading(true);
    externalSetError(null);
    setSuccess(null);

    const payload = { destinationAddress };
    if (mode === 'XP') {
      payload.xpAmount = Number(amount);
    } else {
      payload.usdtAmount = Number(amount);
    }

    try {
      const response = await loyaltyAppClientMethods.post(
        `loyalty/redemption/process`,
        payload,
        '',
        {}
      );

      if (!response.ok) {
        throw new Error(response.message || `An error occurred (Status: ${response.status})`);
      }

      const result = await response.json();
      const successMessage = result.message || 'Redemption processed successfully!';
      setSuccess(successMessage);
      message.success(successMessage);
      return true;
    } catch (err) {
      const errorMessage = err.message || 'An unknown error occurred.';
      externalSetError(errorMessage);
      message.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { processRedemption, loading, success, clearState };
};

// --- Main Component ---
const RedeemWalletModal = ({ visible, onClose, wallet, onRedeem, userId }) => {
  const [form] = Form.useForm();
  const [nestedVisible, setNestedVisible] = useState(false);
  const [convertedValue, setConvertedValue] = useState('');
  const [redeemData, setRedeemData] = useState({});
  const [nestedModelLoading, setNestedModelLoading] = useState(false);
  const [nestedModelError, setNestedModelError] = useState(null); // Single unified error

  const { processRedemption, loading: redemptionLoading, clearState } = useRedemption(userId, setNestedModelError);

  const conversionRate = redeemData?.xpToUsdtRate;
  const minXp = redeemData?.minXp;

  const handleOpenNestedModal = useCallback(() => {
    setNestedVisible(true);
  }, []);

  const handleNestedClose = useCallback(() => {
    setNestedVisible(false);
    form.resetFields();
    setConvertedValue('');
    clearState();
  }, [form, clearState]);

  const handleFormValuesChange = useCallback(
    (changedValues) => {
      const { xpValue } = changedValues;
      if (xpValue && !isNaN(xpValue)) {
        const rawValue = (Number(xpValue) * conversionRate).toFixed(4);
        setConvertedValue(parseFloat(rawValue) > 0 ? parseFloat(rawValue) : '');
      } else {
        setConvertedValue('');
      }
    },
    [conversionRate]
  );

  const handleFinish = useCallback(
    async (values) => {
      const wasSuccessful = await processRedemption({
        mode: 'XP',
        amount: values.xpValue,
        destinationAddress: '0x0000000000000000000000000000000000000000', // Replace as needed
      });

      if (wasSuccessful) {
        if (onRedeem) {
          onRedeem({
            currency: 'XP',
            value: values.xpValue,
            convertedTo: 'USDT',
            convertedAmount: convertedValue,
          });
        }
        handleNestedClose();
      }
    },
    [processRedemption, convertedValue, onRedeem, handleNestedClose]
  );

  useEffect(() => {
    const fetchTransferData = async () => {
      try {
        await getRedeemTransferData(setNestedModelLoading, setRedeemData, setNestedModelError);
      } catch (err) {
        setNestedModelError(err.message || 'Error fetching conversion data');
      }
    };
    if (nestedVisible) {
      fetchTransferData();
    }
  }, [nestedVisible]);

  const closeNestedModelError = useCallback(() => setNestedModelError(null), []);

  return (
    <>
      <Modal 
        open={visible}
        closeIcon={
          <button onClick={onClose}>
            <span className="icon lg close cursor-pointer" title="close"></span>
          </button>
        }
       footer={null} centered className="dark-modal">
        <div>
          <div className="text-center text-xl font-bold text-lightWhite mb-4">
            Transfer to Your Wallet
          </div>
          <p className="text-center text-sm text-gray-400 mb-6">
            Select a balance to add to your personal wallet
          </p>
          {wallet &&
            Object.entries(wallet).map(([currency, balance]) => {
              const icon = currency === 'USDT' ? usdtIcon : xpIcon;
              const formattedBalance = Number(balance).toLocaleString('en-IN', {
                minimumFractionDigits: currency === 'XP' ? 0 : 4,
                maximumFractionDigits: currency === 'XP' ? 0 : 4,
              });

              return (
                <div
                  key={currency}
                  className="items-center justify-between bg-rewardsBtnBg px-4 py-3 rounded-lg mb-4 w-full"
                >
                  <div className="flex-1">
                    <div className="!flex !justify-between">
                      <div className="flex gap-2 items-center">
                        <img src={icon} alt={currency} className="w-6 h-6" />
                        <div>
                          <p className="text-lightWhite font-semibold">{currency}</p>
                          <p className="text-xs text-paraColor">
                            {currency === 'XP' ? 'Experience Points' : 'Tether USD'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-lightWhite font-semibold text-right">{formattedBalance}</p>
                        <p className="text-xs text-paraColor">Available</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right mt-2">
                    <button
                      className="items-center text-primaryColor !border-none text-base font-medium"
                      onClick={currency === 'XP' ? handleOpenNestedModal : () => onRedeem(currency)}
                    >
                      Add to My Wallet <span className="icon btn-arrow shrink-0 ml-1"></span>
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </Modal>

      {/* Nested Modal */}
      <Modal
        open={nestedVisible}
         closeIcon={
          <button onClick={handleNestedClose}>
            <span className="icon lg close cursor-pointer" title="close"></span>
          </button>
        }
        footer={null}
        centered
        className="custom-inner-modal"
        destroyOnClose
      >
        {nestedModelLoading ? (
          <Loader />
        ) : (
          <div>
            <div className="text-lg font-bold text-lightWhite text-center mb-2">
              Convert XP to USDT
            </div>

            {nestedModelError && (
              <div className="alert-flex withdraw-alert fiat-alert mb-4">
                <AppAlert type="error" description={nestedModelError} showIcon />
                <span className="icon sm alert-close" onClick={closeNestedModelError}></span>
              </div>
            )}

            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-paraColor text-left">Min XP: {minXp || '0'}</p>
              <p className="text-sm text-paraColor text-right">
                1 XP = {conversionRate || '0'} USDT
              </p>
            </div>

            <Form
              form={form}
              onFinish={handleFinish}
              onValuesChange={handleFormValuesChange}
              layout="vertical"
              autoComplete="off"
            >
              <Form.Item
                name="xpValue"
                rules={[
                  { required: true, message: 'Please enter an XP amount.' },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (isNaN(value)) return Promise.reject(new Error('Enter a valid number.'));
                      if (Number(value) < minXp)
                        return Promise.reject(new Error(`Minimum amount is ${minXp} XP.`));
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  placeholder="Enter XP amount"
                  className="mb-1 !border !pl-2 !p-0 !border-inputBg !bg-inputBg !h-11 !rounded-5 hover:!border-textPending custom-input-field !shadow-none"
                />
              </Form.Item>

              {convertedValue && (
                <p className="text-textGreen text-sm mb-4">
                  Converted Value: <strong>{convertedValue} USDT</strong>
                </p>
              )}

              <div className="space-y-4 mt-4">
                <CustomButton htmlType="submit" type="primary" className="w-full" loading={redemptionLoading}>
                  Save
                </CustomButton>
                <CustomButton type="button" className="w-full" onClick={handleNestedClose}>
                  Cancel
                </CustomButton>
              </div>
            </Form>
          </div>
        )}
      </Modal>
    </>
  );
};

export default RedeemWalletModal;
