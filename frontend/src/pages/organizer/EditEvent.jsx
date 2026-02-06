import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Plus, Trash2, Loader2 } from 'lucide-react';

const EditEvent = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Music',
    date: '',
    time: '',
    location: '',
    price: 0,
    image: '',
    isOnline: false,
    ticketTypes: []
  });

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const event = await api.getEventById(id);
        
        // Check if user owns this event
        if (event.organizerId !== user.id && user.role !== 'admin') {
          alert('You do not have permission to edit this event.');
          navigate('/organizer/dashboard');
          return;
        }

        // Format date for input (YYYY-MM-DD)
        const eventDate = event.date ? new Date(event.date).toISOString().split('T')[0] : '';
        
        setFormData({
          title: event.title || '',
          description: event.description || '',
          category: event.category || 'Music',
          date: eventDate,
          time: event.time || '',
          location: event.location || '',
          price: event.price || 0,
          image: event.image || '',
          isOnline: event.isOnline || false,
          ticketTypes: event.ticketTypes && event.ticketTypes.length > 0 
            ? event.ticketTypes.map(t => ({ ...t, id: t.id || Date.now() + Math.random() }))
            : [{ id: Date.now(), name: 'General Admission', price: 0, quantity: 100 }]
        });
      } catch (error) {
        alert('Failed to load event: ' + error.message);
        navigate('/organizer/dashboard');
      } finally {
        setLoadingEvent(false);
      }
    };

    if (id && user) {
      loadEvent();
    }
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleTicketChange = (id, field, value) => {
      setFormData({
          ...formData,
          ticketTypes: formData.ticketTypes.map(t => t.id === id ? { ...t, [field]: value } : t)
      });
  };

  const addTicketType = () => {
      setFormData({
          ...formData,
          ticketTypes: [...formData.ticketTypes, { id: Date.now(), name: 'New Ticket', price: 0, quantity: 50 }]
      });
  };

  const removeTicketType = (id) => {
      if (formData.ticketTypes.length === 1) return;
      setFormData({
          ...formData,
          ticketTypes: formData.ticketTypes.filter(t => t.id !== id)
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      alert('Please enter an event title');
      return;
    }
    
    if (!formData.date) {
      alert('Please select an event date');
      return;
    }
    
    if (formData.ticketTypes.length === 0) {
      alert('Please add at least one ticket type');
      return;
    }
    
    setLoading(true);
    try {
      await api.updateEvent(id, formData);
      navigate('/organizer/dashboard');
    } catch (error) {
      alert('Failed to update event: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Event Title" name="title" value={formData.title} onChange={handleChange} required />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {['Music', 'Tech', 'Sports', 'Art', 'Education', 'Food'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
             </div>

             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                 <textarea 
                    name="description" 
                    rows="4" 
                    value={formData.description} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                 ></textarea>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Input label="Date" type="date" name="date" value={formData.date} onChange={handleChange} required />
                 <Input label="Time" type="time" name="time" value={formData.time} onChange={handleChange} required />
                 <div className="flex items-center mt-6">
                     <input type="checkbox" name="isOnline" checked={formData.isOnline} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                     <label className="ml-2 text-gray-700">Online Event?</label>
                 </div>
             </div>

             <Input label="Location / URL" name="location" value={formData.location} onChange={handleChange} required />
             <Input label="Cover Image URL" name="image" value={formData.image} onChange={handleChange} />

             {/* Ticket Types */}
             <div className="border-t border-gray-100 pt-6">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-medium">Ticket Types</h3>
                     <Button type="button" size="sm" variant="secondary" onClick={addTicketType}>
                         <Plus size={16} className="mr-1" /> Add Type
                     </Button>
                 </div>
                 
                 <div className="space-y-4">
                     {formData.ticketTypes.map((ticket) => (
                         <div key={ticket.id} className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg">
                             <div className="flex-grow">
                                 <label className="text-xs text-gray-500">Name</label>
                                 <input 
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={ticket.name}
                                    onChange={(e) => handleTicketChange(ticket.id, 'name', e.target.value)}
                                 />
                             </div>
                             <div className="w-24">
                                 <label className="text-xs text-gray-500">Price</label>
                                 <input 
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={ticket.price}
                                    onChange={(e) => handleTicketChange(ticket.id, 'price', parseFloat(e.target.value) || 0)}
                                 />
                             </div>
                             <div className="w-24">
                                 <label className="text-xs text-gray-500">Quantity</label>
                                  <input 
                                    type="number"
                                    min="1"
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={ticket.quantity}
                                    onChange={(e) => handleTicketChange(ticket.id, 'quantity', parseInt(e.target.value) || 1)}
                                 />
                             </div>
                             {formData.ticketTypes.length > 1 && (
                                 <button type="button" onClick={() => removeTicketType(ticket.id)} className="text-red-500 p-2 hover:bg-red-50 rounded transition-colors">
                                     <Trash2 size={16} />
                                 </button>
                             )}
                         </div>
                     ))}
                 </div>
             </div>

             <div className="flex justify-end gap-4 pt-4">
                 <Button type="button" variant="secondary" onClick={() => navigate('/organizer/dashboard')}>
                     Cancel
                 </Button>
                 <Button type="submit" isLoading={loading}>Update Event</Button>
             </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditEvent;
