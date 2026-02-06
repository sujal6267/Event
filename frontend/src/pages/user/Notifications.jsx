import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Bell, Tag, Calendar, Info, Loader2, Check } from 'lucide-react';

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                if (user) {
                    const data = await api.getUserNotifications(user.id);
                    setNotifications(data);
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            fetchNotifications();
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleMarkAsRead = async (notifId) => {
        try {
            await api.markNotificationRead(notifId);
            setNotifications(notifications.map(n => 
                n.id === notifId ? { ...n, read: true } : n
            ));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''} ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                {unreadCount > 0 && (
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {unreadCount} unread
                    </span>
                )}
            </div>
            
            {notifications.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No notifications</h2>
                        <p className="text-gray-500">You don't have any notifications yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {notifications.map(notif => (
                        <Card 
                            key={notif.id} 
                            className={`cursor-pointer hover:shadow-md transition-shadow ${notif.read ? 'opacity-80' : 'border-l-4 border-l-indigo-500 bg-indigo-50/30'}`}
                            onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                        >
                            <CardContent className="flex gap-4 p-4">
                                <div className={`p-2 rounded-full h-fit flex-shrink-0 ${
                                    notif.type === 'ticket' ? 'bg-green-100 text-green-600' :
                                    notif.type === 'event' ? 'bg-blue-100 text-blue-600' :
                                    notif.type === 'reminder' ? 'bg-yellow-100 text-yellow-600' :
                                    notif.type === 'promo' ? 'bg-purple-100 text-purple-600' :
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {notif.type === 'ticket' ? <Tag size={20} /> :
                                     notif.type === 'event' || notif.type === 'reminder' ? <Calendar size={20} /> :
                                     <Info size={20} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 mb-1">{notif.title}</h4>
                                            <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                                            <p className="text-xs text-gray-400">{formatDate(notif.createdAt)}</p>
                                        </div>
                                        {!notif.read && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkAsRead(notif.id);
                                                }}
                                                className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
                                                title="Mark as read"
                                            >
                                                <Check size={16} className="text-gray-400" />
                                            </button>
                                        )}
                                    </div>
                                    {notif.eventId && (
                                        <Link 
                                            to={`/events/${notif.eventId}`}
                                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-2 inline-block"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            View Event →
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
