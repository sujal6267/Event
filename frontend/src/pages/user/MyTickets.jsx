import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card, CardContent } from '../../components/common/Card';
import { Loader2, Calendar, MapPin, QrCode, Download, Eye, Mail } from 'lucide-react';
import Button from '../../components/common/Button';

const MyTickets = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const data = await api.getUserTickets(user.id);
                setTickets(data);
            } catch (error) {
                console.error('Failed to fetch tickets:', error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchTickets();
    }, [user]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    if (tickets.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <div className="bg-white rounded-xl shadow-sm p-12">
                    <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No tickets found</h2>
                    <p className="text-gray-500 mb-6">You haven't booked any tickets yet.</p>
                    <Link to="/explore">
                        <Button>Explore Events</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tickets</h1>
            <div className="space-y-6">
                {tickets.map(ticket => (
                    <Card key={ticket.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            {/* Event Image */}
                            <div className="w-full md:w-1/3 h-48 md:h-auto">
                                <img src={ticket.eventImage} alt={ticket.eventTitle} className="w-full h-full object-cover" />
                            </div>
                            
                            {/* Ticket Details */}
                            <div className="w-full md:w-2/3 p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{ticket.eventTitle}</h3>
                                    <div className="flex items-center text-gray-600 mb-2">
                                        <Calendar size={16} className="mr-2" />
                                        {ticket.eventDate ? new Date(ticket.eventDate).toLocaleDateString() : 'Date N/A'}
                                    </div>
                                    <div className="flex items-center text-gray-600 mb-4">
                                        <MapPin size={16} className="mr-2" />
                                        <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                                            Ticket ID: {ticket.id}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
                                     <div className="flex flex-col">
                                         <span className="text-xs text-gray-500 uppercase font-bold">Status</span>
                                         <span className={`font-medium ${ticket.status === 'valid' ? 'text-green-600' : 'text-gray-500'}`}>
                                             {ticket.status.toUpperCase()}
                                         </span>
                                     </div>
                                     <div className="flex gap-2">
                                         <Button 
                                            variant="secondary" 
                                            size="sm"
                                            onClick={() => {
                                                // Generate PDF download (mock)
                                                const pdfContent = `Event: ${ticket.eventTitle}\nTicket ID: ${ticket.id}\nQR Code: ${ticket.qrCode}\nDate: ${ticket.eventDate}`;
                                                const blob = new Blob([pdfContent], { type: 'text/plain' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `ticket-${ticket.id}.txt`;
                                                a.click();
                                            }}
                                        >
                                             <Download size={16} className="mr-2" /> Download
                                         </Button>
                                         <Button 
                                            size="sm"
                                            onClick={() => {
                                                setSelectedTicket(ticket);
                                                setShowQR(true);
                                            }}
                                        >
                                             <QrCode size={16} className="mr-2" /> Show QR
                                         </Button>
                                         <Button 
                                            variant="secondary" 
                                            size="sm"
                                            onClick={() => {
                                                // Email ticket (would integrate with email service)
                                                alert('Ticket email sent! (Mock implementation)');
                                            }}
                                        >
                                             <Mail size={16} className="mr-2" /> Email
                                         </Button>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* QR Code Modal */}
            {showQR && selectedTicket && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowQR(false)}>
                    <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <CardContent className="pt-8 pb-8 text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedTicket.eventTitle}</h3>
                            <p className="text-sm text-gray-500 mb-6">Ticket ID: {selectedTicket.id}</p>
                            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 mb-4">
                                <QrCode className="w-48 h-48 mx-auto text-gray-800" />
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <p className="font-mono text-sm break-all text-gray-700">{selectedTicket.qrCode}</p>
                            </div>
                            <p className="text-xs text-gray-500 mb-6">
                                Show this QR code at the event for check-in
                            </p>
                            <Button onClick={() => setShowQR(false)} className="w-full">
                                Close
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default MyTickets;
