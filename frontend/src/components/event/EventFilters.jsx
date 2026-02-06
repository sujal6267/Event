import React from 'react';
import { Search, MapPin, Filter } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

const EventFilters = ({ filters, onChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 sticky top-20 z-10">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Input 
            placeholder="Search events..." 
            className="pl-10"
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
          />
          <Search className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
        </div>

        {/* Location */}
        <div className="relative">
          <Input 
            placeholder="Location (e.g. Kathmandu)" 
            className="pl-10"
            value={filters.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
          />
          <MapPin className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
        </div>

        {/* Category and Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={filters.category || ''}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Music">Music</option>
              <option value="Tech">Tech</option>
              <option value="Sports">Sports</option>
              <option value="Art">Art</option>
              <option value="Education">Education</option>
              <option value="Food">Food</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Price</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              value={filters.priceType || 'all'}
              onChange={(e) => handleChange('priceType', e.target.value)}
            >
              <option value="all">Any Price</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventFilters;
