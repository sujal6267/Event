import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEvents } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import EventCard from '../../components/event/EventCard';
import Button from '../../components/common/Button';
import { ArrowRight, Calendar, MapPin, Search } from 'lucide-react';

const Home = () => {
  const { events, loading } = useEvents();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  const upcomingEvents = events.slice(0, 8);

  const handleCreateEvent = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/organizer/dashboard' } } });
    } else if (user.role !== 'organizer' && user.role !== 'admin') {
      alert('Please register as an organizer to create events.');
      navigate('/register');
    } else {
      navigate('/organizer/dashboard');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (locationQuery) params.append('location', locationQuery);
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Concert Crowd" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Discover <span className="text-indigo-500">Unforgettable</span> Events in Nepal
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl">
              From electrifying music festivals to inspiring tech conferences, find your next experience here.
            </p>
            
            <form onSubmit={handleSearch} className="bg-white p-2 rounded-lg shadow-lg max-w-2xl flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-gray-100">
                <Search className="text-gray-400 mr-3" />
                <input 
                  type="text" 
                  placeholder="Search events, artists..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full outline-none text-gray-800 placeholder-gray-400"
                />
              </div>
              <div className="flex-1 flex items-center px-4 py-2">
                <MapPin className="text-gray-400 mr-3" />
                <input 
                  type="text" 
                  placeholder="Location (e.g. Kathmandu)" 
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full outline-none text-gray-800 placeholder-gray-400"
                />
              </div>
              <Button type="submit" className="w-full md:w-auto h-full rounded-md shadow-none">Search</Button>
            </form>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
                <Link to="/explore" className="text-indigo-600 font-medium hover:text-indigo-500 flex items-center">
                    View all <ArrowRight size={16} className="ml-1" />
                </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {['Music', 'Tech', 'Sports', 'Art', 'Education', 'Food'].map(cat => (
                    <Link to={`/explore?category=${cat}`} key={cat} className="group">
                        <div className="bg-gray-50 rounded-xl p-6 text-center hover:bg-indigo-50 transition-colors border border-gray-100 hover:border-indigo-100">
                            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">{cat}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
            <Link to="/explore" className="text-indigo-600 font-medium hover:text-indigo-500 flex items-center">
              View all <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => (
                    <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse"></div>
                ))}
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

       {/* CTA Section */}
       <section className="bg-indigo-700 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                <h2 className="text-3xl font-bold mb-4">Create Your Own Event</h2>
                <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
                    Host your event with us and reach thousands of attendees. It's free to get started.
                </p>
                <div className="flex justify-center gap-4">
                    <Button variant="secondary" size="lg" onClick={handleCreateEvent}>
                        Create Event
                    </Button>
                </div>
            </div>
       </section>
    </div>
  );
};

export default Home;
