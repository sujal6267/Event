import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Button from '../../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Plus, BarChart3, Users, Calendar, Edit, Trash2, QrCode, TrendingUp, Download, Eye } from 'lucide-react';

const OrganizerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({ totalEvents: 0, totalTickets: 0, revenue: 0 });
    const [deletingId, setDeletingId] = useState(null);

    const handleEdit = (eventId) => {
        navigate(`/organizer/events/edit/${eventId}`);
    };

    const handleDelete = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            return;
        }
        
        setDeletingId(eventId);
        try {
            await api.deleteEvent(eventId);
            setEvents(events.filter(e => e.id !== eventId));
            setStats(prev => ({ ...prev, totalEvents: prev.totalEvents - 1 }));
        } catch (error) {
            alert('Failed to delete event: ' + error.message);
        } finally {
            setDeletingId(null);
        }
    };

    const generateCSV = (events) => {
        const headers = ['Event Name', 'Date', 'Time', 'Location', 'Category', 'Status', 'Tickets Available', 'Tickets Sold'];
        const rows = events.map(event => [
            event.title,
            event.date,
            event.time,
            event.location,
            event.category,
            event.status,
            event.ticketTypes.reduce((sum, tt) => sum + tt.quantity, 0),
            0 // Would need actual sold count
        ]);
        
        return [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
    };

    useEffect(() => {
        const fetchOrganizerData = async () => {
             try {
                 const myEvents = await api.getOrganizerEvents(user.id);
                 setEvents(myEvents);

                 // Get analytics
                 try {
                     const analytics = await api.getOrganizerAnalytics(user.id);
                     setStats({
                         totalEvents: analytics.stats.totalEvents || myEvents.length,
                         totalTickets: analytics.stats.totalTicketsSold || 0,
                         revenue: analytics.stats.totalRevenue || 0
                     });
                 } catch (analyticsError) {
                     // Fallback if analytics unavailable
                     setStats({
                         totalEvents: myEvents.length,
                         totalTickets: 0,
                         revenue: 0
                     });
                 }
             } catch (error) {
                 console.error('Failed to fetch organizer events:', error);
             }
        };
        if (user?.id) {
            fetchOrganizerData();
        }
    }, [user?.id]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Organizer Dashboard</h1>
                <Link to="/organizer/events/new">
                    <Button>
                        <Plus className="w-5 h-5 mr-2" /> Create Event
                    </Button>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="p-3 bg-indigo-100 rounded-full text-indigo-600 mr-4">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Events</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.totalEvents}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="p-3 bg-green-100 rounded-full text-green-600 mr-4">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Tickets Sold</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.totalTickets}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600 mr-4">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-900">NPR {stats.revenue.toLocaleString()}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Events Management */}
                <Card>
                    <CardHeader className="flex justify-between items-center">
                        <CardTitle>My Events</CardTitle>
                        <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={async () => {
                                try {
                                    // Generate CSV export
                                    const csv = generateCSV(events);
                                    const blob = new Blob([csv], { type: 'text/csv' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `events-export-${new Date().toISOString().split('T')[0]}.csv`;
                                    a.click();
                                } catch (err) {
                                    alert('Failed to export CSV: ' + err.message);
                                }
                            }}
                        >
                            <Download size={16} className="mr-2" />
                            Export CSV
                        </Button>
                    </CardHeader>
                    <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                    <th className="py-4 font-medium">Event Name</th>
                                    <th className="py-4 font-medium">Date</th>
                                    <th className="py-4 font-medium">Status</th>
                                    <th className="py-4 font-medium">Tickets Sold</th>
                                    <th className="py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map(event => (
                                    <tr key={event.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                        <td className="py-4">
                                            <div className="font-medium text-gray-900">{event.title}</div>
                                            <div className="text-sm text-gray-500">{event.location}</div>
                                        </td>
                                        <td className="py-4 text-gray-600">
                                            {new Date(event.date).toLocaleDateString()}
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                event.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                                event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="py-4 text-gray-600">
                                            {/* Mock sold count */}
                                            {Math.min(event.ticketTypes[0].quantity, 45)} / {event.ticketTypes.reduce((acc, t) => acc + t.quantity, 0)}
                                        </td>
                                        <td className="py-4 text-right space-x-2">
                                            <Link to={`/organizer/analytics/${event.id}`}>
                                                <Button size="sm" variant="secondary" title="View Analytics">
                                                    <TrendingUp size={16} />
                                                </Button>
                                            </Link>
                                            <Link to={`/organizer/check-in/${event.id}`}>
                                                <Button size="sm" variant="secondary" title="Check-in App">
                                                    <QrCode size={16} />
                                                </Button>
                                            </Link>
                                            <Button size="sm" variant="secondary" onClick={() => handleEdit(event.id)} title="Edit Event">
                                                <Edit size={16} />
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="danger" 
                                                onClick={() => handleDelete(event.id)}
                                                isLoading={deletingId === event.id}
                                                disabled={deletingId === event.id}
                                                title="Delete Event"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {events.length === 0 && <div className="text-center py-8 text-gray-500">No events found. Create one to get started!</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OrganizerDashboard;
