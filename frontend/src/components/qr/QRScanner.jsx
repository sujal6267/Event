import React, { useEffect, useRef, useState } from 'react';
import { ScanLine, X, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Button from '../common/Button';

const QRScanner = ({ onScan, onClose, eventId }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    if (scanning && scannerRef.current && !html5QrCodeRef.current) {
      startScanning().catch((err) => {
        console.error('Error starting scanner:', err);
        setError('Failed to start scanner. Please try again.');
        setScanning(false);
      });
    }

    return () => {
      stopScanning();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  const startScanning = async () => {
    try {
      // Dynamic import to handle ESM/CommonJS compatibility with Vite
      const { Html5Qrcode } = await import('html5-qrcode');
      
      if (!scannerRef.current) {
        setError('Scanner element not found');
        return;
      }
      
      const html5QrCode = new Html5Qrcode(scannerRef.current.id);
      html5QrCodeRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText, decodedResult) => {
          // Success callback
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignore scan errors - they're common when scanning
        }
      ).catch((err) => {
        console.error('Unable to start scanning:', err);
        setError('Unable to access camera. Please check permissions.');
        setScanning(false);
      });
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Failed to start scanner. Please try again.');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (html5QrCodeRef.current && scanning) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          html5QrCodeRef.current.clear();
          html5QrCodeRef.current = null;
        })
        .catch((err) => {
          console.error('Error stopping scanner:', err);
        });
    }
  };

  const handleScanSuccess = async (qrCode, shouldCheckIn = false) => {
    stopScanning();
    setScanning(false);
    
    if (onScan) {
      try {
        setCheckingIn(true);
        const result = await onScan(qrCode, eventId, shouldCheckIn);
        setResult(result);
        setCheckingIn(false);
        
        // Auto-close after 3 seconds if successful check-in
        if (result.valid && result.checkedIn) {
          setTimeout(() => {
            setResult(null);
            setError('');
            // Don't auto-close, allow scanning more tickets
          }, 3000);
        }
      } catch (err) {
        setError(err.message || 'Failed to validate QR code');
        setResult({
          valid: false,
          error: err.message || 'Failed to validate QR code'
        });
        setCheckingIn(false);
      }
    } else {
      setResult({
        valid: true,
        qrCode,
        message: 'QR code scanned successfully'
      });
    }
  };

  const handleStartScan = () => {
    setError('');
    setResult(null);
    setScanning(true);
  };

  const handleStopScan = () => {
    stopScanning();
    setScanning(false);
  };

  const handleManualEntry = () => {
    const qrCode = prompt('Enter QR code manually:');
    if (qrCode && onScan) {
      handleScanSuccess(qrCode, false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Scanner View */}
      <div className="relative">
        <div
          id="qr-scanner"
          ref={scannerRef}
          className={`w-full rounded-lg overflow-hidden ${scanning ? 'min-h-[300px] bg-gray-900' : 'min-h-[200px] bg-gray-100 flex items-center justify-center'}`}
        >
          {!scanning && (
            <div className="text-center p-8">
              <ScanLine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Click "Start Scanning" to begin</p>
            </div>
          )}
        </div>

        {/* Overlay instructions */}
        {scanning && (
          <div className="absolute top-4 left-0 right-0 text-center">
            <div className="bg-black/70 text-white px-4 py-2 rounded-lg inline-block">
              <p className="text-sm">Position QR code within the frame</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!scanning ? (
          <>
            <Button
              onClick={handleStartScan}
              className="flex-1"
              disabled={scanning}
            >
              <ScanLine size={18} className="mr-2" />
              Start Scanning
            </Button>
            <Button
              onClick={handleManualEntry}
              variant="secondary"
              className="flex-1"
            >
              Manual Entry
            </Button>
          </>
        ) : (
          <Button
            onClick={handleStopScan}
            variant="secondary"
            className="w-full"
          >
            <X size={18} className="mr-2" />
            Stop Scanning
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div
          className={`border rounded-lg p-4 ${
            result.valid
              ? result.alreadyUsed
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {result.valid ? (
              result.alreadyUsed ? (
                <XCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={24} />
              ) : (
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={24} />
              )
            ) : (
              <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
            )}
            <div className="flex-1">
              <h4 className="font-bold text-lg mb-2">
                {result.valid
                  ? result.alreadyUsed
                    ? 'Ticket Already Used'
                    : 'Ticket Valid ✓'
                  : 'Invalid Ticket'}
              </h4>
              {result.ticket && (
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Ticket ID:</span> {result.ticket.id}
                  </div>
                  {result.eventTitle && (
                    <div>
                      <span className="font-medium">Event:</span> {result.eventTitle}
                    </div>
                  )}
                  {result.userName && (
                    <div>
                      <span className="font-medium">Attendee:</span> {result.userName}
                    </div>
                  )}
                  {result.ticketTypeName && (
                    <div>
                      <span className="font-medium">Type:</span> {result.ticketTypeName}
                    </div>
                  )}
                </div>
              )}
              <p className={`mt-2 text-sm ${result.valid ? (result.alreadyUsed ? 'text-yellow-700' : 'text-green-700') : 'text-red-700'}`}>
                {result.message || result.error}
              </p>
              {result.valid && !result.alreadyUsed && !result.checkedIn && (
                <Button
                  onClick={async () => {
                    if (result.ticket && onScan) {
                      try {
                        const checkInResult = await onScan(result.ticket.qrCode, eventId, true); // Check-in
                        setResult({ ...result, ...checkInResult });
                      } catch (err) {
                        setError(err.message || 'Failed to check in ticket');
                      }
                    }
                  }}
                  className="mt-3 w-full"
                  size="sm"
                  disabled={checkingIn}
                >
                  {checkingIn ? 'Checking In...' : 'Check In'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
