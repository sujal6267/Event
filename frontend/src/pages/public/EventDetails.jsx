import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Reviews from '../../components/event/Reviews';
import { api } from '../../services/api';
import Button from '../../components/common/Button';
import { Card, CardContent } from '../../components/common/Card';
import PaymentModal from '../../components/payment/PaymentModal';
import DiscountCodeInput from '../../components/discount/DiscountCodeInput';
import { Calendar, MapPin, Clock, Share2, Globe, Heart, ArrowLeft, Loader2, Download, Mail, User, CalendarPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [discount, setDiscount] = useState(null);
  const [hasRSVP, setHasRSVP] = useState(false);
  const [rsvping, setRsvping] = useState(false);
  const [isFreeEvent, setIsFreeEvent] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const data = await api.getEventById(id);
        setEvent(data);
        
        // Check if event is free
        const minPrice = Math.min(...(data.ticketTypes || []).map(t => t.price || 0));
        setIsFreeEvent(minPrice === 0);
        
        if (data.ticketTypes && data.ticketTypes.length > 0) {
            setSelectedTicket(data.ticketTypes[0].id);
        }
        
        // Check if user has RSVP'd (if logged in)
        if (user && isFreeEvent) {
          try {
            const rsvps = await api.getUserRSVPs(user.id);
            const existingRSVP = rsvps.find(r => r.eventId === id && r.status === 'confirmed');
            setHasRSVP(!!existingRSVP);
          } catch (err) {
            // Ignore RSVP check errors
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      loadEvent();
    }
  }, [id, user]);

  const handleBuy = async () => {
      if (!user) {
          navigate('/login', { state: { from: location } });
          return;
      }
      
      if (!selectedTicket) {
          alert('Please select a ticket type');
          return;
      }

      const selectedTicketType = event.ticketTypes.find(t => t.id === selectedTicket);
      if (!selectedTicketType) {
          alert('Invalid ticket selection');
          return;
      }

      if (selectedTicketType.quantity < quantity) {
          alert(`Only ${selectedTicketType.quantity} tickets available`);
          return;
      }

      const totalAmount = selectedTicketType.price * quantity;
      const finalAmount = discount ? (totalAmount - discount.discount) : totalAmount;
      
      // If free ticket, use RSVP flow or book directly
      if (finalAmount === 0) {
          if (isFreeEvent && !hasRSVP) {
              // For free events, prompt for RSVP
              const shouldRSVP = window.confirm('This is a free event. Would you like to RSVP?');
              if (shouldRSVP) {
                  await handleRSVP();
                  return;
              }
          }
          await processBooking(null, null, null);
      } else {
          setShowPaymentModal(true);
      }
  };

  const handleRSVP = async () => {
      if (!user) {
          navigate('/login', { state: { from: location } });
          return;
      }

      setRsvping(true);
      try {
          await api.rsvpEvent(event.id, user.id);
          setHasRSVP(true);
          alert('RSVP confirmed! You will receive a confirmation email.');
      } catch (err) {
          alert('RSVP failed: ' + err.message);
      } finally {
          setRsvping(false);
      }
  };

  const handleCancelRSVP = async () => {
      if (!window.confirm('Are you sure you want to cancel your RSVP?')) return;

      setRsvping(true);
      try {
          await api.cancelRSVP(event.id, user.id);
          setHasRSVP(false);
          alert('RSVP cancelled successfully.');
      } catch (err) {
          alert('Failed to cancel RSVP: ' + err.message);
      } finally {
          setRsvping(false);
      }
  };

  const handleDiscountApplied = (discountData) => {
      setDiscount(discountData);
  };

  const handleAddToCalendar = async (calendarType = 'google') => {
      try {
          const result = await api.getCalendarLink(event.id, calendarType);
          if (result.url) {
              window.open(result.url, '_blank');
          }
      } catch (err) {
          alert('Failed to generate calendar link: ' + err.message);
      }
  };

  const handlePaymentSuccess = async (payment) => {
      setPaymentData(payment);
      setShowPaymentModal(false);
      await processBooking(payment.id, payment.transactionId);
  };

  const processBooking = async (paymentId, transactionId, promoCode = null) => {
      setBuying(true);
      try {
          const result = await api.bookTicketWithPayment(
              user.id, 
              event.id, 
              selectedTicket, 
              quantity,
              paymentId,
              transactionId
          );
          
          const selectedTicketType = event.ticketTypes.find(t => t.id === selectedTicket);
          const originalAmount = selectedTicketType?.price * quantity || 0;
          const finalAmount = discount ? discount.finalAmount : originalAmount;
          
          navigate('/order-confirmation', { 
              state: { 
                  orderId: result.tickets[0]?.id || `ORD-${Date.now()}`, 
                  eventName: event.title,
                  quantity: quantity,
                  ticketPrice: finalAmount,
                  originalAmount: originalAmount,
                  discount: discount?.discount || 0,
                  discountCode: promoCode,
                  tickets: result.tickets,
                  transactionId: result.transactionId
              } 
          });
      } catch (err) {
          alert('Booking failed: ' + err.message);
      } finally {
          setBuying(false);
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (error || !event) return <div className="min-h-screen flex items-center justify-center text-red-600">Event not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Banner */}
      <div className="h-80 md:h-96 relative w-full bg-gray-900">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover opacity-60" />
        <div className="absolute top-4 left-4">
            <Link to="/explore">
                <Button variant="ghost" className="text-white hover:bg-white/20">
                    <ArrowLeft size={20} className="mr-2" /> Back
                </Button>
            </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardContent className="pt-8">
                        <div className="flex justify-between items-start mb-4">
                             <div className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                {event.category}
                             </div>
                             <div className="flex gap-2">
                                 <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Heart /></button>
                                 <button className="p-2 text-gray-400 hover:text-indigo-500 transition-colors"><Share2 /></button>
                             </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600 mb-8">
                             <div className="flex items-center">
                                 <Calendar className="mr-3 text-indigo-600" />
                                 <span>{new Date(event.date).toLocaleDateString()}</span>
                             </div>
                             <div className="flex items-center">
                                 <Clock className="mr-3 text-indigo-600" />
                                 <span>{event.time}</span>
                             </div>
                             <div className="flex items-center">
                                 <MapPin className="mr-3 text-indigo-600" />
                                 <span>{event.location}</span>
                             </div>
                              <div className="flex items-center">
                                 <Globe className="mr-3 text-indigo-600" />
                                 <span>{event.isOnline ? 'Online Event' : 'In-Person'}</span>
                             </div>
                        </div>

                        {/* Organizer Details */}
                        {event.organizer && (
                            <div className="border-t border-gray-100 pt-6 mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Organizer</h3>
                                <div className="flex items-center gap-4">
                                    {event.organizer.profileImage ? (
                                        <img 
                                            src={event.organizer.profileImage} 
                                            alt={event.organizer.name}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <User size={24} className="text-indigo-600" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-gray-900">{event.organizer.name}</p>
                                        <p className="text-sm text-gray-500">{event.organizer.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="prose max-w-none text-gray-600 border-t border-gray-100 pt-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">About this Event</h3>
                            <p>{event.description}</p>
                            <p>Here is more placeholder text describing the amazing details of this event. It will be a night to remember with incredible performances and networking opportunities.</p>
                        </div>

                        {/* Calendar Integration */}
                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Add to Calendar</h3>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleAddToCalendar('google')}
                                >
                                    <CalendarPlus size={16} className="mr-2" />
                                    Google Calendar
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleAddToCalendar('outlook')}
                                >
                                    <CalendarPlus size={16} className="mr-2" />
                                    Outlook
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleAddToCalendar('ical')}
                                >
                                    <Download size={16} className="mr-2" />
                                    Download .ics
                                </Button>
                            </div>
                        </div>

                        <Reviews eventId={event.id} />
                    </CardContent>
                </Card>

                {/* Map Placeholder */}
                {!event.isOnline && (
                    <Card className="h-64 bg-gray-200 flex items-center justify-center text-gray-500">
                         Map Integration Placeholder (Google Maps)
                    </Card>
                )}
            </div>

            {/* Sidebar Ticket Selection */}
            <div className="lg:col-span-1">
                <Card className="sticky top-24">
                    <CardContent>
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Select Tickets</h3>
                        
                        <div className="space-y-4 mb-8">
                            {event.ticketTypes && event.ticketTypes.length > 0 ? (
                                event.ticketTypes.map(ticket => (
                                    <div 
                                        key={ticket.id}
                                        className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedTicket === ticket.id ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-gray-200 hover:border-indigo-300'}`}
                                        onClick={() => setSelectedTicket(ticket.id)}
                                    >
                                        <div className="flex justify-between mb-1">
                                            <span className="font-semibold text-gray-900">{ticket.name}</span>
                                            <span className="font-bold text-indigo-600">{ticket.price === 0 ? 'Free' : `NPR ${ticket.price.toLocaleString()}`}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {ticket.quantity > 0 ? `${ticket.quantity} remaining` : 'Sold out'}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-gray-500">No tickets available</div>
                            )}
                        </div>

                        <div className="flex items-center justify-between mb-6 bg-gray-50 p-3 rounded-lg">
                            <span className="font-medium text-gray-700">Quantity</span>
                            <div className="flex items-center gap-3">
                                <button 
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >-</button>
                                <span className="w-8 text-center font-bold">{quantity}</span>
                                <button 
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-white"
                                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                                >+</button>
                            </div>
                        </div>

                        {/* Discount Code Input */}
                        {(() => {
                            const ticket = event.ticketTypes.find(t => t.id === selectedTicket);
                            const totalAmount = ticket ? ticket.price * quantity : 0;
                            return totalAmount > 0 && (
                                <div className="mb-6">
                                    <DiscountCodeInput
                                        onDiscountApplied={handleDiscountApplied}
                                        amount={totalAmount}
                                        eventId={event.id}
                                    />
                                </div>
                            );
                        })()}

                        {/* Price Summary */}
                        {(() => {
                            const ticket = event.ticketTypes.find(t => t.id === selectedTicket);
                            const totalAmount = ticket ? ticket.price * quantity : 0;
                            const finalAmount = discount ? discount.finalAmount : totalAmount;
                            return totalAmount > 0 && (
                                <div className="mb-6 bg-gray-50 p-4 rounded-lg space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">NPR {totalAmount.toLocaleString()}</span>
                                    </div>
                                    {discount && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Discount ({discount.code}):</span>
                                            <span className="font-medium">-NPR {discount.discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                                        <span>Total:</span>
                                        <span className="text-indigo-600">NPR {finalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* RSVP for Free Events */}
                        {isFreeEvent && user && (
                            <div className="mb-6">
                                {hasRSVP ? (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-green-900">✓ You're RSVP'd!</p>
                                                <p className="text-sm text-green-700">We'll send you a reminder before the event.</p>
                                            </div>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={handleCancelRSVP}
                                                isLoading={rsvping}
                                            >
                                                Cancel RSVP
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        className="w-full mb-4"
                                        variant="secondary"
                                        onClick={handleRSVP}
                                        isLoading={rsvping}
                                    >
                                        <CalendarPlus size={18} className="mr-2" />
                                        RSVP for Free
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Booking Button */}
                        {user ? (
                            <Button 
                                className="w-full py-4 text-lg" 
                                onClick={handleBuy} 
                                isLoading={buying || rsvping}
                                disabled={!selectedTicket || (event.ticketTypes.find(t => t.id === selectedTicket)?.quantity || 0) < quantity || (isFreeEvent && hasRSVP)}
                            >
                                {buying ? 'Processing...' : (() => {
                                    const ticket = event.ticketTypes.find(t => t.id === selectedTicket);
                                    const totalAmount = ticket ? ticket.price * quantity : 0;
                                    const finalAmount = discount ? discount.finalAmount : totalAmount;
                                    if (isFreeEvent && hasRSVP) return 'Already RSVP\'d';
                                    if (isFreeEvent) return 'RSVP for Free';
                                    return `Book Now - ${finalAmount === 0 ? 'Free' : `NPR ${finalAmount.toLocaleString()}`}`;
                                })()}
                            </Button>
                        ) : (
                            <Link to="/login" state={{ from: location }}>
                                <Button className="w-full" variant="secondary">Login to Book</Button>
                            </Link>
                        )}
                        
                        <p className="text-xs text-center text-gray-400 mt-4">
                            By booking, you agree to our Terms of Service.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={(() => {
            const ticket = event.ticketTypes.find(t => t.id === selectedTicket);
            const totalAmount = ticket ? ticket.price * quantity : 0;
            return discount ? discount.finalAmount : totalAmount;
          })()}
          eventTitle={event.title}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default EventDetails;
