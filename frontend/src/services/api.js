import { MOCK_USERS, MOCK_EVENTS, MOCK_TICKETS } from '../data/mocks';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class MockService {
    constructor() {
        // Initialize state from local storage or mocks
        this.users = JSON.parse(localStorage.getItem('users')) || MOCK_USERS;
        this.events = JSON.parse(localStorage.getItem('events')) || MOCK_EVENTS;
        this.tickets = JSON.parse(localStorage.getItem('tickets')) || MOCK_TICKETS;
    }

    save() {
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('events', JSON.stringify(this.events));
        localStorage.setItem('tickets', JSON.stringify(this.tickets));
    }

    // Auth
    async login(email, password) {
        await delay(500);
        const user = this.users.find(u => u.email === email && u.password === password);
        if (!user) throw new Error('Invalid credentials');
        const { password: _, ...userWithoutPass } = user;
        return userWithoutPass;
    }

    async register(userData) {
        await delay(500);
        if (this.users.find(u => u.email === userData.email)) throw new Error('User already exists');
        const newUser = { id: Date.now().toString(), ...userData, myTickets: [] };
        this.users.push(newUser);
        this.save();
        const { password: _, ...userWithoutPass } = newUser;
        return userWithoutPass;
    }

    // Events
    async getEvents() {
        await delay(500);
        return this.events.filter(e => e.status === 'approved');
    }

    async getAllEventsAdmin() {
        await delay(500);
        return this.events;
    }

    async getEventById(id) {
        await delay(300);
        const event = this.events.find(e => e.id === id);
        if (!event) throw new Error('Event not found');
        return event;
    }

    async createEvent(eventData) {
        await delay(500);
        const newEvent = { ...eventData, id: Date.now().toString(), status: 'pending' }; // Default to pending
        this.events.push(newEvent);
        this.save();
        return newEvent;
    }

    async updateEvent(id, updates) {
        await delay(500);
        const index = this.events.findIndex(e => e.id === id);
        if (index === -1) throw new Error('Event not found');
        this.events[index] = { ...this.events[index], ...updates };
        this.save();
        return this.events[index];
    }

    async deleteEvent(id) {
        await delay(500);
        const index = this.events.findIndex(e => e.id === id);
        if (index === -1) throw new Error('Event not found');
        this.events.splice(index, 1);
        this.save();
        return { success: true };
    }

    async getOrganizerEvents(organizerId) {
        await delay(500);
        return this.events.filter(e => e.organizerId === organizerId);
    }

    async getUsers() {
        await delay(500);
        return this.users.map(u => {
            const { password, ...userWithoutPass } = u;
            return userWithoutPass;
        });
    }

    // Tickets
    async bookTicket(userId, eventId, ticketTypeId, quantity) {
        await delay(800);
        const event = this.events.find(e => e.id === eventId);
        if (!event) throw new Error('Event not found');

        const ticketType = event.ticketTypes.find(t => t.id === ticketTypeId);
        if (!ticketType) throw new Error('Ticket type not found');

        if (ticketType.quantity < quantity) {
            throw new Error(`Only ${ticketType.quantity} tickets available for ${ticketType.name}`);
        }

        // Decrement ticket quantity
        ticketType.quantity -= quantity;

        // Create tickets
        const newTickets = [];
        for (let i = 0; i < quantity; i++) {
            const ticket = {
                id: `t-${Date.now()}-${i}`,
                userId,
                eventId,
                ticketTypeId,
                purchaseDate: new Date().toISOString(),
                status: 'valid',
                qrCode: `QR-${eventId}-${userId}-${Date.now()}-${i}`
            };
            this.tickets.push(ticket);
            newTickets.push(ticket);
        }

        this.save();
        return newTickets;
    }

    async getUserTickets(userId) {
        await delay(500);
        // Join events to tickets for display
        return this.tickets
            .filter(t => t.userId === userId)
            .map(ticket => {
                const event = this.events.find(e => e.id === ticket.eventId);
                return { ...ticket, eventTitle: event?.title, eventImage: event?.image, eventDate: event?.date };
            });
    }

    // Payment
    async processPayment(paymentData) {
        await delay(1500);
        // Mock payment processing
        if (paymentData.cardNumber && paymentData.cardNumber.replace(/\s/g, '').length < 13) {
            throw new Error('Invalid card number');
        }
        return {
            success: true,
            payment: {
                id: `pay-${Date.now()}`,
                transactionId: `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`,
                amount: paymentData.amount,
                paymentMethod: paymentData.paymentMethod,
                status: 'completed',
                createdAt: new Date().toISOString()
            }
        };
    }

    // Updated bookTicket to include payment
    async bookTicketWithPayment(userId, eventId, ticketTypeId, quantity, paymentId, transactionId) {
        await delay(800);
        const event = this.events.find(e => e.id === eventId);
        if (!event) throw new Error('Event not found');

        const ticketType = event.ticketTypes.find(t => t.id === ticketTypeId);
        if (!ticketType) throw new Error('Ticket type not found');

        if (ticketType.quantity < quantity) {
            throw new Error(`Only ${ticketType.quantity} tickets available for ${ticketType.name}`);
        }

        const totalAmount = ticketType.price * quantity;
        if (totalAmount > 0 && !paymentId && !transactionId) {
            throw new Error('Payment is required for paid tickets');
        }

        // Decrement ticket quantity
        ticketType.quantity -= quantity;

        // Create tickets
        const newTickets = [];
        for (let i = 0; i < quantity; i++) {
            const ticket = {
                id: `t-${Date.now()}-${i}`,
                userId,
                eventId,
                ticketTypeId,
                purchaseDate: new Date().toISOString(),
                status: 'valid',
                qrCode: `QR-${eventId}-${userId}-${Date.now()}-${i}`,
                paymentId: paymentId || null,
                transactionId: transactionId || null,
                amountPaid: totalAmount > 0 ? ticketType.price : 0
            };
            this.tickets.push(ticket);
            newTickets.push(ticket);
        }

        this.save();
        return {
            tickets: newTickets,
            totalAmount,
            quantity,
            paymentId: paymentId || null,
            transactionId: transactionId || null
        };
    }

    // QR Code Validation
    async validateQRCode(qrCode, eventId) {
        await delay(500);
        // Mock validation - in real app, this would call the backend
        // For now, check if QR code matches our pattern
        if (!qrCode || !qrCode.startsWith('QR-')) {
            throw new Error('Invalid QR code format');
        }
        const ticketId = qrCode.split('-')[1] || `t-${Date.now()}`;
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) {
            throw new Error('Ticket not found');
        }
        if (ticket.status === 'used') {
            return {
                valid: true,
                ticket,
                alreadyUsed: true,
                message: 'Ticket has already been used'
            };
        }
        return {
            valid: true,
            ticket,
            alreadyUsed: false,
            message: 'Ticket is valid'
        };
    }

    async checkInTicket(ticketId, eventId) {
        await delay(500);
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) throw new Error('Ticket not found');
        if (ticket.status === 'used') throw new Error('Ticket has already been used');
        ticket.status = 'used';
        ticket.checkedInAt = new Date().toISOString();
        this.save();
        return ticket;
    }

    // Payment Processing
    async processPayment(paymentData) {
        await delay(1500);
        const { gateway = 'generic', amount, paymentMethod } = paymentData;
        
        // Mock payment processing
        const transactionId = `${gateway.toUpperCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
        
        return {
            success: true,
            payment: {
                id: `pay-${Date.now()}`,
                transactionId,
                amount,
                paymentMethod,
                gateway,
                status: 'completed',
                createdAt: new Date().toISOString()
            }
        };
    }

    // Promotions/Discount Codes
    async validatePromotionCode(code, eventId, amount) {
        await delay(500);
        // Mock validation - in real app, call backend
        const promotions = JSON.parse(localStorage.getItem('promotions')) || [];
        const promo = promotions.find(p => p.code.toUpperCase() === code.toUpperCase() && p.isActive);
        
        if (!promo) {
            return { valid: false, error: 'Invalid or expired discount code' };
        }

        if (amount < promo.minPurchase) {
            return { 
                valid: false, 
                error: `Minimum purchase of NPR ${promo.minPurchase} required` 
            };
        }

        let discount = 0;
        if (promo.type === 'percentage') {
            discount = (amount * promo.value) / 100;
            if (promo.maxDiscount && discount > promo.maxDiscount) {
                discount = promo.maxDiscount;
            }
        } else {
            discount = promo.value;
            if (promo.maxDiscount && discount > promo.maxDiscount) {
                discount = promo.maxDiscount;
            }
        }

        return {
            valid: true,
            promotion: {
                id: promo.id,
                code: promo.code,
                type: promo.type,
                value: promo.value,
                discount,
                finalAmount: Math.max(0, amount - discount),
                originalAmount: amount
            }
        };
    }

    // RSVP
    async rsvpEvent(eventId, userId) {
        await delay(500);
        const rsvps = JSON.parse(localStorage.getItem('rsvps')) || [];
        const existing = rsvps.find(r => r.eventId === eventId && r.userId === userId);
        if (existing && existing.status === 'confirmed') {
            throw new Error('You have already RSVP\'d for this event');
        }
        const rsvp = {
            id: `rsvp-${Date.now()}`,
            eventId,
            userId,
            status: 'confirmed',
            rsvpDate: new Date().toISOString()
        };
        rsvps.push(rsvp);
        localStorage.setItem('rsvps', JSON.stringify(rsvps));
        return rsvp;
    }

    async cancelRSVP(eventId, userId) {
        await delay(500);
        const rsvps = JSON.parse(localStorage.getItem('rsvps')) || [];
        const index = rsvps.findIndex(r => r.eventId === eventId && r.userId === userId);
        if (index === -1) throw new Error('RSVP not found');
        rsvps[index].status = 'cancelled';
        localStorage.setItem('rsvps', JSON.stringify(rsvps));
        return rsvps[index];
    }

    async getUserRSVPs(userId) {
        await delay(500);
        const rsvps = JSON.parse(localStorage.getItem('rsvps')) || [];
        return rsvps.filter(r => r.userId === userId).map(rsvp => {
            const event = this.events.find(e => e.id === rsvp.eventId);
            return {
                ...rsvp,
                eventTitle: event?.title,
                eventImage: event?.image,
                eventDate: event?.date
            };
        });
    }

    // Notifications
    async getUserNotifications(userId) {
        await delay(500);
        // Mock - would fetch from backend
        return JSON.parse(localStorage.getItem(`notifications-${userId}`)) || [];
    }

    async markNotificationRead(notificationId) {
        await delay(300);
        // Mock - would update on backend
        return { success: true };
    }

    // Feedback/Reviews
    async submitFeedback(eventId, rating, comment, title, userId = null) {
        await delay(500);
        const feedback = {
            id: `fb-${Date.now()}`,
            eventId,
            userId: userId || this.users[0]?.id || '1',
            rating,
            comment,
            title,
            createdAt: new Date().toISOString()
        };
        const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
        
        // Check if user already reviewed this event and update instead
        const existingIndex = feedbacks.findIndex(f => f.eventId === eventId && f.userId === feedback.userId);
        if (existingIndex !== -1) {
            feedbacks[existingIndex] = { ...feedbacks[existingIndex], ...feedback, updatedAt: new Date().toISOString() };
        } else {
            feedbacks.push(feedback);
        }
        
        localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
        return existingIndex !== -1 ? feedbacks[existingIndex] : feedback;
    }

    async getEventFeedbacks(eventId) {
        await delay(500);
        const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
        const eventFeedbacks = feedbacks.filter(f => f.eventId === eventId && !f.reported);
        
        // Calculate average rating and total reviews
        const avgRating = eventFeedbacks.length > 0
            ? eventFeedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / eventFeedbacks.length
            : 0;
        
        // Join with user data for display
        const feedbacksWithUsers = eventFeedbacks.map(feedback => {
            const user = this.users.find(u => u.id === feedback.userId);
            return {
                ...feedback,
                userName: user?.name || 'Anonymous',
                userImage: user?.profileImage || null
            };
        });
        
        return {
            feedbacks: feedbacksWithUsers,
            averageRating: Math.round(avgRating * 10) / 10,
            totalReviews: feedbacksWithUsers.length
        };
    }

    // Calendar
    async getCalendarLink(eventId, type = 'google') {
        await delay(300);
        const event = this.events.find(e => e.id === eventId);
        if (!event) throw new Error('Event not found');
        
        // In real app, call backend
        // For now, generate client-side
        const startDate = new Date(`${event.date}T${event.time || '00:00'}:00`);
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 2);
        
        if (type === 'google') {
            const formatDate = (date) => {
                return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            };
            const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.location || '')}`;
            return { url, type: 'google' };
        }
        
        return { url: '#', type };
    }

    // Analytics
    async getEventAnalytics(eventId) {
        await delay(500);
        const event = this.events.find(e => e.id === eventId);
        if (!event) throw new Error('Event not found');
        
        const tickets = this.tickets.filter(t => t.eventId === eventId);
        const totalSold = tickets.length;
        const revenue = tickets.reduce((sum, t) => sum + (t.amountPaid || 0), 0);
        
        return {
            event: { id: event.id, title: event.title },
            overview: {
                totalTicketsAvailable: event.ticketTypes.reduce((sum, tt) => sum + tt.quantity, 0),
                totalTicketsSold: totalSold,
                totalRevenue: revenue,
                averageTicketPrice: totalSold > 0 ? (revenue / totalSold).toFixed(2) : 0
            }
        };
    }

    async getOrganizerAnalytics(organizerId) {
        await delay(500);
        const events = this.events.filter(e => e.organizerId === organizerId);
        let totalRevenue = 0;
        let totalSold = 0;
        
        events.forEach(event => {
            const tickets = this.tickets.filter(t => t.eventId === event.id);
            totalSold += tickets.length;
            totalRevenue += tickets.reduce((sum, t) => sum + (t.amountPaid || 0), 0);
        });
        
        return {
            stats: {
                totalEvents: events.length,
                totalTicketsSold: totalSold,
                totalRevenue
            }
        };
    }

    // Categories
    async getCategories() {
        await delay(300);
        return [
            { id: 'cat1', name: 'Music', slug: 'music', icon: '🎵' },
            { id: 'cat2', name: 'Tech', slug: 'tech', icon: '💻' },
            { id: 'cat3', name: 'Sports', slug: 'sports', icon: '⚽' },
            { id: 'cat4', name: 'Art', slug: 'art', icon: '🎨' },
            { id: 'cat5', name: 'Education', slug: 'education', icon: '📚' },
            { id: 'cat6', name: 'Food', slug: 'food', icon: '🍕' }
        ];
    }

    // Admin Analytics
    async getAdminAnalytics() {
        await delay(500);
        const users = this.users;
        const events = this.events;
        const tickets = this.tickets;
        
        let totalRevenue = 0;
        tickets.forEach(ticket => {
            const event = this.events.find(e => e.id === ticket.eventId);
            if (event) {
                const ticketType = event.ticketTypes.find(tt => tt.id === ticket.ticketTypeId);
                totalRevenue += ticket.amountPaid || ticketType?.price || 0;
            }
        });

        return {
            overview: {
                totalUsers: users.length,
                totalEvents: events.length,
                totalTicketsSold: tickets.length,
                totalRevenue
            },
            eventsByStatus: {
                approved: events.filter(e => e.status === 'approved').length,
                pending: events.filter(e => e.status === 'pending').length,
                rejected: events.filter(e => e.status === 'rejected').length
            },
            usersByRole: {
                user: users.filter(u => u.role === 'user').length,
                organizer: users.filter(u => u.role === 'organizer').length,
                admin: users.filter(u => u.role === 'admin').length
            }
        };
    }

    // Admin Event Management
    async featureEvent(eventId) {
        await delay(500);
        const event = this.events.find(e => e.id === eventId);
        if (!event) throw new Error('Event not found');
        event.featured = true;
        event.featuredAt = new Date().toISOString();
        event.status = 'approved';
        this.save();
        return event;
    }

    async unfeatureEvent(eventId) {
        await delay(500);
        const event = this.events.find(e => e.id === eventId);
        if (!event) throw new Error('Event not found');
        event.featured = false;
        this.save();
        return event;
    }
}

export const api = new MockService();
