import React, { useState } from 'react';
import { api } from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';
import { Tag, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const DiscountCodeInput = ({ onDiscountApplied, amount, eventId }) => {
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [discount, setDiscount] = useState(null);
  const [error, setError] = useState('');

  const handleValidate = async () => {
    if (!code.trim()) {
      setError('Please enter a discount code');
      return;
    }

    setValidating(true);
    setError('');
    setDiscount(null);

    try {
      const result = await api.validatePromotionCode(code, eventId, amount);
      if (result.valid) {
        setDiscount(result.promotion);
        if (onDiscountApplied) {
          onDiscountApplied(result.promotion);
        }
      } else {
        setError(result.error || 'Invalid discount code');
      }
    } catch (err) {
      setError(err.message || 'Failed to validate discount code');
    } finally {
      setValidating(false);
    }
  };

  const handleRemove = () => {
    setCode('');
    setDiscount(null);
    setError('');
    if (onDiscountApplied) {
      onDiscountApplied(null);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Have a discount code?</label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder="Enter code (e.g. EARLYBIRD20)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={validating || !!discount}
            className="pr-10"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !validating && !discount) {
                handleValidate();
              }
            }}
          />
          <Tag className="absolute right-3 top-3.5 text-gray-400 w-4 h-4" size={16} />
        </div>
        {!discount ? (
          <Button
            onClick={handleValidate}
            isLoading={validating}
            disabled={validating || !code.trim()}
            variant="secondary"
          >
            Apply
          </Button>
        ) : (
          <Button
            onClick={handleRemove}
            variant="secondary"
            size="sm"
          >
            Remove
          </Button>
        )}
      </div>

      {discount && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle className="text-green-600 flex-shrink-0" size={18} />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">
              Code applied: {discount.code}
            </p>
            <p className="text-xs text-green-700">
              You saved NPR {discount.discount.toLocaleString()}!
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <XCircle className="text-red-600 flex-shrink-0" size={18} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default DiscountCodeInput;
