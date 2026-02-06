import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Ticket } from 'lucide-react';
import { Card, CardContent } from '../common/Card';
import Button from '../common/Button';

const EventCard = ({ event }) => {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-600 uppercase tracking-wide">
          {event.category}
        </div>
        {event.price === 0 && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            Free
          </div>
        )}
      </div>
      
      <CardContent className="flex flex-col justify-between h-[calc(100%-12rem)]">
        <div>
          <div className="flex items-center text-sm text-indigo-600 font-medium mb-2">
            <Calendar size={14} className="mr-1.5" />
            {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            <span className="mx-2">•</span>
            <Clock size={14} className="mr-1.5" />
            {event.time}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-indigo-600">
            <Link to={`/events/${event.id}`}>{event.title}</Link>
          </h3>
          
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <MapPin size={14} className="mr-1.5 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Starting from</span>
            <span className="text-lg font-bold text-gray-900">
              {event.price === 0 ? 'Free' : `NPR ${event.price}`}
            </span>
          </div>
          <Link to={`/events/${event.id}`}>
            <Button size="sm" variant="secondary">
              <Ticket size={16} className="mr-1.5" />
              Get Ticket
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
