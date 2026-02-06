import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { CreditCard, X, Lock, Wallet } from 'lucide-react';
import { api } from '../../services/api';

const PaymentModal = ({ isOpen, onClose, amount, onPaymentSuccess, eventTitle }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      // Format card number with spaces
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      setFormData({ ...formData, [name]: formatted });
    } else if (name === 'expiryDate') {
      // Format expiry date MM/YY
      const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      setFormData({ ...formData, [name]: formatted });
    } else if (name === 'cvv') {
      // Limit CVV to 3-4 digits
      const formatted = value.replace(/\D/g, '').substring(0, 4);
      setFormData({ ...formData, [name]: formatted });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      // Validate form based on payment method
      if (paymentMethod === 'card') {
        if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 13) {
          throw new Error('Please enter a valid card number');
        }
        if (!formData.cardHolder || formData.cardHolder.length < 3) {
          throw new Error('Please enter cardholder name');
        }
        if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
          throw new Error('Please enter a valid expiry date (MM/YY)');
        }
        if (!formData.cvv || formData.cvv.length < 3) {
          throw new Error('Please enter a valid CVV');
        }
      }

      // Determine gateway based on payment method
      let gateway = 'generic';
      if (paymentMethod === 'paypal') gateway = 'paypal';
      else if (paymentMethod === 'esewa') gateway = 'esewa';
      else if (paymentMethod === 'khalti') gateway = 'khalti';
      else if (paymentMethod === 'card') gateway = 'stripe';
      
      // For wallet/cash, create mock payment
      let paymentResult;
      if (paymentMethod === 'wallet' || paymentMethod === 'cash') {
        paymentResult = {
          success: true,
          payment: {
            id: `pay-${Date.now()}`,
            transactionId: `TXN-${paymentMethod.toUpperCase()}-${Date.now()}`,
            amount,
            paymentMethod,
            gateway: 'venue',
            status: 'pending', // Will be confirmed at venue
            createdAt: new Date().toISOString()
          }
        };
      } else if (paymentMethod === 'esewa' || paymentMethod === 'khalti') {
        // For eSewa/Khalti, redirect to gateway (mock)
        paymentResult = {
          success: true,
          payment: {
            id: `pay-${Date.now()}`,
            transactionId: `${paymentMethod.toUpperCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`,
            amount,
            paymentMethod,
            gateway,
            status: 'processing',
            redirectUrl: `https://${paymentMethod}.com/payment?amount=${amount}`, // Mock redirect
            createdAt: new Date().toISOString()
          }
        };
      } else {
        // Process card/PayPal payment
        const paymentData = {
          gateway,
          amount,
          paymentMethod,
          ...(paymentMethod === 'card' && {
            cardNumber: formData.cardNumber.replace(/\s/g, ''),
            cardHolder: formData.cardHolder,
            expiryDate: formData.expiryDate,
            cvv: formData.cvv
          })
        };
        paymentResult = await api.processPayment(paymentData);
      }

      if (paymentResult.success && paymentResult.payment) {
        onPaymentSuccess(paymentResult.payment);
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (err) {
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <CreditCard size={20} />
            Complete Payment
          </CardTitle>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="text-sm text-gray-600 mb-1">Event</div>
              <div className="font-semibold text-gray-900">{eventTitle}</div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-indigo-600">NPR {amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard size={24} className="mx-auto mb-1" />
                <span className="text-xs font-medium">Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'paypal'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Wallet size={24} className="mx-auto mb-1" />
                <span className="text-xs font-medium">PayPal</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('esewa')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'esewa'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Wallet size={24} className="mx-auto mb-1" />
                <span className="text-xs font-medium">eSewa</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('khalti')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'khalti'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Wallet size={24} className="mx-auto mb-1" />
                <span className="text-xs font-medium">Khalti</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'wallet'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Lock size={24} className="mx-auto mb-1" />
                <span className="text-xs font-medium">Wallet</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Lock size={24} className="mx-auto mb-1" />
                <span className="text-xs font-medium">Cash</span>
              </button>
            </div>
          </div>

          {(paymentMethod === 'card' || paymentMethod === 'paypal' || paymentMethod === 'esewa' || paymentMethod === 'khalti') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {paymentMethod === 'card' && (
                <>
                  <Input
                    label="Card Number"
                    name="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    maxLength={19}
                    required
                  />
                  <Input
                    label="Cardholder Name"
                    name="cardHolder"
                    type="text"
                    placeholder="John Doe"
                    value={formData.cardHolder}
                    onChange={handleChange}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry Date"
                      name="expiryDate"
                      type="text"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      maxLength={5}
                      required
                    />
                    <Input
                      label="CVV"
                      name="cvv"
                      type="text"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={handleChange}
                      maxLength={4}
                      required
                    />
                  </div>
                </>
              )}
              
              {(paymentMethod === 'paypal' || paymentMethod === 'esewa' || paymentMethod === 'khalti') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  {paymentMethod === 'paypal' && (
                    <p>You will be redirected to PayPal to complete your payment securely.</p>
                  )}
                  {paymentMethod === 'esewa' && (
                    <p>You will be redirected to eSewa to complete your payment. Make sure you have an active eSewa account.</p>
                  )}
                  {paymentMethod === 'khalti' && (
                    <p>You will be redirected to Khalti to complete your payment. Make sure you have an active Khalti account.</p>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1"
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={processing}
                >
                  Pay NPR {amount.toLocaleString()}
                </Button>
              </div>
            </form>
          )}

          {(paymentMethod === 'wallet' || paymentMethod === 'cash') && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800">
                {paymentMethod === 'wallet'
                  ? 'Wallet payments will be processed at the venue. Please bring your wallet app.'
                  : 'Cash payments will be collected at the venue during check-in.'}
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1"
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    // Create mock payment for wallet/cash
                    handleSubmit(e);
                  }}
                  className="flex-1"
                  isLoading={processing}
                >
                  Confirm {paymentMethod === 'wallet' ? 'Wallet' : 'Cash'} Payment
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Lock size={12} />
              <span>Your payment information is secure and encrypted</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentModal;
