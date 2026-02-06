import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Download, ArrowLeft, Loader2 } from 'lucide-react';

const EventAnalytics = () => {
    const { id } = useParams();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [analyticsData, eventData] = await Promise.all([
                    api.getEventAnalytics(id),
                    api.getEventById(id)
                ]);
                setAnalytics(analyticsData);
                setEvent(eventData);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchData();
        }
    }, [id]);

    const exportReport = async (format = 'csv') => {
        try {
            if (format === 'csv') {
                const csv = generateCSV(analytics);
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `event-analytics-${event?.title?.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
            } else {
                // PDF export would require a library like jsPDF
                alert('PDF export coming soon!');
            }
        } catch (err) {
            alert('Failed to export report: ' + err.message);
        }
    };

    const generateCSV = (data) => {
        if (!data) return '';
        
        const headers = ['Metric', 'Value'];
        const rows = [
            ['Total Tickets Available', data.overview?.totalTicketsAvailable || 0],
            ['Total Tickets Sold', data.overview?.totalTicketsSold || 0],
            ['Total Revenue', data.overview?.totalRevenue || 0],
            ['Average Ticket Price', data.overview?.averageTicketPrice || 0],
            ['Check-in Rate', data.overview?.checkInRate || '0%'],
            ['Total RSVPs', data.overview?.totalRSVPs || 0]
        ];
        
        return [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load analytics</p>
                    <Link to="/organizer/dashboard">
                        <Button variant="secondary">Back to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/organizer/dashboard">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft size={18} className="mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Event Analytics</h1>
                        <p className="text-gray-500 mt-1">{event?.title}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => exportReport('csv')}>
                        <Download size={16} className="mr-2" />
                        Export CSV
                    </Button>
                    <Button variant="secondary" onClick={() => exportReport('pdf')}>
                        <Download size={16} className="mr-2" />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="p-3 bg-indigo-100 rounded-full text-indigo-600 mr-4">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Tickets Sold</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {analytics.overview?.totalTicketsSold || 0}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                of {analytics.overview?.totalTicketsAvailable || 0} available
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="p-3 bg-green-100 rounded-full text-green-600 mr-4">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                NPR {analytics.overview?.totalRevenue?.toLocaleString() || 0}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Avg: NPR {analytics.overview?.averageTicketPrice || 0}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600 mr-4">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Check-in Rate</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {analytics.overview?.checkInRate || '0%'}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                {analytics.overview?.totalTicketsCheckedIn || 0} checked in
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center p-6">
                        <div className="p-3 bg-purple-100 rounded-full text-purple-600 mr-4">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">RSVPs</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {analytics.overview?.totalRSVPs || 0}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Free event attendees
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tickets by Type */}
            {analytics.ticketsByType && analytics.ticketsByType.length > 0 && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Tickets by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                        <th className="py-3 text-left font-medium">Ticket Type</th>
                                        <th className="py-3 text-right font-medium">Total</th>
                                        <th className="py-3 text-right font-medium">Sold</th>
                                        <th className="py-3 text-right font-medium">Checked In</th>
                                        <th className="py-3 text-right font-medium">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.ticketsByType.map((tt, index) => (
                                        <tr key={index} className="border-b border-gray-50 last:border-0">
                                            <td className="py-3 font-medium text-gray-900">{tt.ticketType}</td>
                                            <td className="py-3 text-right text-gray-600">{tt.total}</td>
                                            <td className="py-3 text-right text-gray-600">{tt.sold}</td>
                                            <td className="py-3 text-right text-gray-600">{tt.checkedIn}</td>
                                            <td className="py-3 text-right font-semibold text-indigo-600">
                                                NPR {tt.revenue.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Sales Over Time */}
            {analytics.salesByDay && analytics.salesByDay.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Over Time (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {analytics.salesByDay.slice(-7).map((day, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="w-24 text-sm text-gray-600">
                                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                                        <div 
                                            className="bg-indigo-600 h-full rounded-full transition-all"
                                            style={{ 
                                                width: `${(day.count / Math.max(...analytics.salesByDay.map(d => d.count))) * 100}%` 
                                            }}
                                        />
                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                                            {day.count} tickets
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default EventAnalytics;
