import React, { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';
import { Card, CardContent } from '../common/Card';
import { Loader2 } from 'lucide-react';

const Reviews = ({ eventId }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '', title: '' });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await api.getEventFeedbacks(eventId);
                setReviews(data.feedbacks || data || []);
                setAverageRating(data.averageRating || 0);
                setTotalReviews(data.totalReviews || data.length || 0);
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };
        if (eventId) {
            fetchReviews();
        }
    }, [eventId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to submit a review');
            return;
        }

        setSubmitting(true);
        try {
            const feedback = await api.submitFeedback(eventId, newReview.rating, newReview.comment, newReview.title, user.id);
            // Refresh reviews to get updated data
            const data = await api.getEventFeedbacks(eventId);
            setReviews(data.feedbacks || []);
            setAverageRating(data.averageRating || 0);
            setTotalReviews(data.totalReviews || 0);
            setNewReview({ rating: 5, comment: '', title: '' });
            setShowForm(false);
        } catch (error) {
            alert('Failed to submit review: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="mt-8">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Reviews ({totalReviews})</h3>
                    {averageRating > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        size={16} 
                                        fill={i < Math.round(averageRating) ? "currentColor" : "none"}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-600">
                                {averageRating.toFixed(1)} out of 5
                            </span>
                        </div>
                    )}
                </div>
                {user && (
                    <Button variant="secondary" onClick={() => setShowForm(!showForm)}>
                        Write a Review
                    </Button>
                )}
            </div>

            {showForm && (
                <Card className="mb-8">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[5,4,3,2,1].map(rating => (
                                        <button
                                            key={rating}
                                            type="button"
                                            onClick={() => setNewReview({...newReview, rating})}
                                            className={`p-2 rounded-lg border-2 transition-all ${
                                                newReview.rating >= rating
                                                    ? 'border-yellow-500 bg-yellow-50 text-yellow-600'
                                                    : 'border-gray-200 text-gray-400 hover:border-gray-300'
                                            }`}
                                        >
                                            <Star size={24} fill={newReview.rating >= rating ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Input
                                label="Title (optional)"
                                placeholder="Give your review a title"
                                value={newReview.title}
                                onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows="4"
                                    placeholder="Share your experience..."
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                    required
                                ></textarea>
                            </div>
                            <div className="flex gap-3">
                                <Button 
                                    type="button" 
                                    variant="secondary" 
                                    onClick={() => {
                                        setShowForm(false);
                                        setNewReview({ rating: 5, comment: '', title: '' });
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" isLoading={submitting}>
                                    Post Review
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {reviews.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map(review => (
                        <div key={review.id} className="bg-white p-4 rounded-lg border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    {review.userImage ? (
                                        <img 
                                            src={review.userImage} 
                                            alt={review.userName || 'User'}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                            <User size={14} className="text-gray-500" />
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-semibold text-gray-900 block">{review.userName || 'Anonymous'}</span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(review.createdAt || review.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill={i < (review.rating || 0) ? "currentColor" : "none"} />
                                    ))}
                                </div>
                            </div>
                            {review.title && (
                                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                            )}
                            <p className="text-gray-600 text-sm">{review.comment}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reviews;
