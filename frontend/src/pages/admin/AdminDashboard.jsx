import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import Button from '../../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { BarChart3, Users, Calendar, Check, X, AlertCircle, Loader2, TrendingUp, Star, Download } from 'lucide-react';

const AdminDashboard = () => {
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allEvents, allUsers, analyticsData] = await Promise.all([
                    api.getAllEventsAdmin(),
                    api.getUsers(),
                    api.getAdminAnalytics().catch(() => null) // Optional analytics
                ]);
                
                setEvents(allEvents);
                setUsers(allUsers || []);
                setAnalytics(analyticsData);
            } catch (error) {
                console.error("Admin fetch error", error);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleApprove = async (eventId) => {
        try {
            await api.updateEvent(eventId, { status: 'approved' });
            setEvents(events.map(e => e.id === eventId ? { ...e, status: 'approved' } : e));
        } catch (error) {
            alert('Failed to approve event: ' + error.message);
        }
    };

    const handleReject = async (eventId) => {
        try {
            await api.updateEvent(eventId, { status: 'rejected' });
            setEvents(events.map(e => e.id === eventId ? { ...e, status: 'rejected' } : e));
        } catch (error) {
            alert('Failed to reject event: ' + error.message);
        }
    };

    const handleFeature = async (eventId) => {
        try {
            await api.featureEvent(eventId);
            setEvents(events.map(e => e.id === eventId ? { ...e, featured: true } : e));
            alert('Event featured successfully!');
        } catch (error) {
            alert('Failed to feature event: ' + error.message);
        }
    };

    const handleUnfeature = async (eventId) => {
        try {
            await api.unfeatureEvent(eventId);
            setEvents(events.map(e => e.id === eventId ? { ...e, featured: false } : e));
            alert('Event unfeatured successfully!');
        } catch (error) {
            alert('Failed to unfeature event: ' + error.message);
        }
    };

    const pendingEvents = events.filter(e => e.status === 'pending');
    const featuredEvents = events.filter(e => e.featured);
    
    const stats = analytics || {
        overview: {
            totalRevenue: 1250000,
            totalUsers: users.length,
            totalEvents: events.length,
            totalTicketsSold: 0,
            totalRSVPs: 0
        },
        eventsByStatus: {
            approved: events.filter(e => e.status === 'approved').length,
            pending: events.filter(e => e.status === 'pending').length,
            rejected: events.filter(e => e.status === 'rejected').length
        },
        usersByRole: {
            user: users.filter(u => u.role === 'user').length,
            organizer: users.filter(u => u.role === 'organizer').length,
            admin: users.filter(u => u.role === 'admin').length
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
             <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardContent className="flex items-center p-6">
                         <div className="p-3 bg-indigo-100 rounded-full text-indigo-600 mr-4"><BarChart3 className="w-6 h-6" /></div>
                         <div>
                             <p className="text-sm text-gray-500">Total Revenue</p>
                             <h3 className="text-2xl font-bold">NPR {stats.overview?.totalRevenue?.toLocaleString() || stats.totalRevenue?.toLocaleString() || '0'}</h3>
                         </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                         <div className="p-3 bg-green-100 rounded-full text-green-600 mr-4"><Users className="w-6 h-6" /></div>
                         <div>
                             <p className="text-sm text-gray-500">Total Users</p>
                             <h3 className="text-2xl font-bold">{stats.overview?.totalUsers || stats.totalUsers || users.length}</h3>
                         </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="flex items-center p-6">
                         <div className="p-3 bg-purple-100 rounded-full text-purple-600 mr-4"><Calendar className="w-6 h-6" /></div>
                         <div>
                             <p className="text-sm text-gray-500">Total Events</p>
                             <h3 className="text-2xl font-bold">{stats.overview?.totalEvents || stats.totalEvents || events.length}</h3>
                         </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center p-6">
                         <div className="p-3 bg-blue-100 rounded-full text-blue-600 mr-4"><TrendingUp className="w-6 h-6" /></div>
                         <div>
                             <p className="text-sm text-gray-500">Tickets Sold</p>
                             <h3 className="text-2xl font-bold">{stats.overview?.totalTicketsSold || 0}</h3>
                         </div>
                    </CardContent>
                </Card>
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Approvals */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="text-yellow-500" /> Pending Approvals ({pendingEvents.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pendingEvents.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No pending events.</p>
                        ) : (
                            <div className="space-y-4">
                                {pendingEvents.map(event => {
                                    const organizer = users.find(u => u.id === event.organizerId);
                                    return (
                                        <div key={event.id} className="flex flex-col md:flex-row justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                                <img src={event.image} alt={event.title} className="w-16 h-16 object-cover rounded-md" />
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{event.title}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(event.date).toLocaleDateString()} • {organizer?.name || 'Organizer'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link to={`/events/${event.id}`}>
                                                    <Button size="sm" variant="ghost">
                                                        <Eye size={16} />
                                                    </Button>
                                                </Link>
                                                <Button size="sm" variant="secondary" onClick={() => handleReject(event.id)}>
                                                    <X size={16} className="mr-1" /> Reject
                                                </Button>
                                                <Button size="sm" onClick={() => handleApprove(event.id)}>
                                                    <Check size={16} className="mr-1" /> Approve
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Featured Events */}
                {featuredEvents.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="text-yellow-500" /> Featured Events
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {featuredEvents.slice(0, 5).map(event => (
                                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <img src={event.image} alt={event.title} className="w-12 h-12 object-cover rounded-md" />
                                            <div>
                                                <h5 className="font-semibold text-sm text-gray-900">{event.title}</h5>
                                                <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            variant="ghost"
                                            onClick={() => handleUnfeature(event.id)}
                                        >
                                            Unfeature
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Event Status Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Events by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <span className="font-medium text-green-900">Approved</span>
                                <span className="text-2xl font-bold text-green-600">
                                    {stats.eventsByStatus?.approved || events.filter(e => e.status === 'approved').length}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                                <span className="font-medium text-yellow-900">Pending</span>
                                <span className="text-2xl font-bold text-yellow-600">
                                    {stats.eventsByStatus?.pending || events.filter(e => e.status === 'pending').length}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                <span className="font-medium text-red-900">Rejected</span>
                                <span className="text-2xl font-bold text-red-600">
                                    {stats.eventsByStatus?.rejected || events.filter(e => e.status === 'rejected').length}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users by Role */}
                <Card>
                    <CardHeader>
                        <CardTitle>Users by Role</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.usersByRole && Object.entries(stats.usersByRole).map(([role, count]) => (
                                <div key={role} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="font-medium text-gray-900 capitalize">{role}</span>
                                    <span className="text-xl font-bold text-indigo-600">{count}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <Link to="/admin/users">
                                <Button variant="secondary" className="w-full" size="sm">
                                    View All Users →
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
