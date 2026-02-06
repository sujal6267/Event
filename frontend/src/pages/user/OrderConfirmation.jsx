import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import { Card, CardContent } from '../../components/common/Card';

const OrderConfirmation = () => {
    const location = useLocation();
    const state = location.state || {};
    const { orderId, eventName, quantity } = state;

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-gray-50">
            <Card className="max-w-md w-full text-center">
                <CardContent className="pt-12 pb-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                    <p className="text-gray-600 mb-8">
                        You have successfully booked {quantity} ticket(s) for <br/>
                        <span className="font-semibold text-gray-900">{eventName || 'Event'}</span>
                    </p>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-500">Order ID</span>
                            <span className="font-mono font-medium">{orderId || 'ORD-12345'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Email sent to</span>
                            <span className="font-medium">user@example.com</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link to="/my-tickets">
                            <Button className="w-full">
                                View My Tickets <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                        <Link to="/explore">
                            <Button variant="ghost" className="w-full">Back to Home</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OrderConfirmation;
