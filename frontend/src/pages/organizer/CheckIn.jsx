import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Card, CardContent } from '../../components/common/Card';
import QRScanner from '../../components/qr/QRScanner';
import { Calendar, MapPin, Loader2, CheckCircle } from 'lucide-react';

const CheckIn = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [validationResult, setValidationResult] = useState(null);
    const [checkingIn, setCheckingIn] = useState(false);
    const [checkedInTickets, setCheckedInTickets] = useState([]);

    useEffect(() => {
        const loadEvent = async () => {
            try {
                if (id) {
                    const eventData = await api.getEventById(id);
                    setEvent(eventData);
                }
            } catch (error) {
                console.error('Failed to load event:', error);
            } finally {
                setLoading(false);
            }
        };
        loadEvent();
    }, [id]);

    const handleQRScan = async (qrCode, eventId, checkIn = false) => {
        try {
            setCheckingIn(true);
            
            // Validate QR code
            const validation = await api.validateQRCode(qrCode, eventId);
            
            if (!validation.valid) {
                setValidationResult(validation);
                return validation;
            }

            // If check-in requested and ticket is valid, check it in
            if (checkIn && validation.valid && !validation.alreadyUsed) {
                try {
                    await api.checkInTicket(validation.ticket.id, eventId);
                    setValidationResult({
                        ...validation,
                        message: 'Ticket checked in successfully!',
                        checkedIn: true
                    });
                    
                    // Add to checked in list
                    setCheckedInTickets(prev => [...prev, validation.ticket.id]);
                    
                    return {
                        ...validation,
                        checkedIn: true,
                        message: 'Ticket checked in successfully!'
                    };
                } catch (checkInError) {
                    setValidationResult({
                        ...validation,
                        error: checkInError.message,
                        valid: false
                    });
                    return validation;
                }
            }

            setValidationResult(validation);
            return validation;
        } catch (error) {
            const errorResult = {
                valid: false,
                error: error.message || 'Failed to validate QR code'
            };
            setValidationResult(errorResult);
            return errorResult;
        } finally {
            setCheckingIn(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto px-4 py-12">
            {event && (
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <h2 className="font-bold text-lg text-gray-900 mb-2">{event.title}</h2>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                            <Calendar size={14} className="mr-2" />
                            {new Date(event.date).toLocaleDateString()} at {event.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <MapPin size={14} className="mr-2" />
                            {event.location}
                        </div>
                    </CardContent>
                </Card>
            )}
            
            <Card>
                <CardContent className="pt-6 pb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Event Check-In</h1>
                    <p className="text-gray-500 mb-6 text-center">Scan attendee QR codes to validate and check them in.</p>

                    <QRScanner 
                        onScan={handleQRScan}
                        eventId={id}
                    />

                    {checkedInTickets.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="text-green-600" size={20} />
                                <h3 className="font-semibold text-gray-900">Checked In Today</h3>
                            </div>
                            <p className="text-2xl font-bold text-green-600">{checkedInTickets.length}</p>
                            <p className="text-sm text-gray-500">tickets checked in</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CheckIn;
