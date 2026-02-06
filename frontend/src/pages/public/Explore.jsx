import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useEvents } from '../../context/EventContext';
import EventCard from '../../components/event/EventCard';
import EventFilters from '../../components/event/EventFilters';
import { Filter } from 'lucide-react';

const Explore = () => {
  const { events, loading } = useEvents();
  const location = useLocation();
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    priceType: 'all',
  });

  const filteredEvents = useMemo(() => {
     if (loading) return [];
     let result = events;

    // Filter by Category
    if (filters.category) {
      result = result.filter(e => e.category === filters.category);
    }

    // Filter by Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(q) || 
        e.location.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      );
    }

    // Filter by Location
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      result = result.filter(e => e.location.toLowerCase().includes(loc));
    }

    // Filter by Price Type
    if (filters.priceType === 'free') {
      result = result.filter(e => {
        const minPrice = Math.min(...e.ticketTypes.map(t => t.price));
        return minPrice === 0;
      });
    } else if (filters.priceType === 'paid') {
      result = result.filter(e => {
        const minPrice = Math.min(...e.ticketTypes.map(t => t.price));
        return minPrice > 0;
      });
    }

    return result;
  }, [events, filters, loading]);

  useEffect(() => {
      // Update filters if URL param changes
      const params = new URLSearchParams(location.search);
      const cat = params.get('category');
      const search = params.get('search');
      const loc = params.get('location');
      
      if (cat || search || loc) {
          setFilters(prev => ({
              ...prev,
              category: cat || prev.category,
              search: search || prev.search,
              location: loc || prev.location
          }));
      }
  }, [location.search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Explore Events</h1>
        <span className="text-gray-500">{filteredEvents.length} results found</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="lg:w-1/4">
          <EventFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Event Grid */}
        <div className="lg:w-3/4">
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse"></div>
                ))}
             </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No events found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
