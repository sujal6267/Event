import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Plus, Trash2 } from 'lucide-react';

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Music',
    date: '',
    time: '',
    location: '',
    price: 0,
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    isOnline: false,
    ticketTypes: [{ id: Date.now(), name: 'General Admission', price: 0, quantity: 100 }]
  });

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
    
    if (new Date(formData.date) < new Date().setHours(0, 0, 0, 0)) {
      alert('Event date must be in the future');
      return;
    }
    
    if (formData.ticketTypes.length === 0) {
      alert('Please add at least one ticket type');
      return;
    }
    
    setLoading(true);
    try {
      await api.createEvent({ ...formData, organizerId: user.id });
      navigate('/organizer/dashboard');
    } catch (error) {
      alert('Failed to create event: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Event Title" name="title" value={formData.title} onChange={handleChange} required />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                 ></textarea>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Input 
                     label="Date" 
                     type="date" 
                     name="date" 
                     value={formData.date} 
                     onChange={handleChange} 
                     min={new Date().toISOString().split('T')[0]}
                     required 
                 />
                 <Input label="Time" type="time" name="time" value={formData.time} onChange={handleChange} required />
                 <div className="flex items-center mt-6">
                     <input 
                         type="checkbox" 
                         name="isOnline" 
                         checked={formData.isOnline} 
                         onChange={handleChange} 
                         className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" 
                         id="isOnline"
                     />
                     <label htmlFor="isOnline" className="ml-2 text-gray-700 cursor-pointer">Online Event?</label>
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
                                    required
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
                                    onChange={(e) => handleTicketChange(ticket.id, 'price', Math.max(0, parseFloat(e.target.value) || 0))}
                                 />
                             </div>
                             <div className="w-24">
                                 <label className="text-xs text-gray-500">Quantity</label>
                                  <input 
                                    type="number"
                                    min="1"
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={ticket.quantity}
                                    onChange={(e) => handleTicketChange(ticket.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                                 />
                             </div>
                             {formData.ticketTypes.length > 1 && (
                                 <button type="button" onClick={() => removeTicketType(ticket.id)} className="text-red-500 p-2 hover:bg-red-50 rounded">
                                     <Trash2 size={16} />
                                 </button>
                             )}
                         </div>
                     ))}
                 </div>
             </div>

             <div className="flex justify-end pt-4">
                 <Button type="submit" isLoading={loading}>Create Event</Button>
             </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEvent;
