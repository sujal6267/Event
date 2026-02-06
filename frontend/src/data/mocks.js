export const MOCK_USERS = [
    {
        id: '1',
        name: 'Sonu User',
        email: 'user@example.com',
        password: 'password123',
        role: 'user', // 'user', 'organizer', 'admin'
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        myTickets: ['t1']
    },
    {
        id: '2',
        name: 'Jane Organizer',
        email: 'org@example.com',
        password: 'password123',
        role: 'organizer',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        myEvents: ['e1']
    },
    {
        id: '3',
        name: 'Super Admin',
        email: 'admin@example.com',
        password: 'admin',
        role: 'admin',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    }
];

export const MOCK_EVENTS = [
    {
        id: 'e1',
        title: 'Neon Music Festival 2024',
        organizerId: '2',
        description: 'Experience the most electrifying music festival of the year with top DJs from around the globe.',
        category: 'Music',
        date: '2024-12-25',
        time: '18:00',
        location: 'Kathmandu Arena',
        price: 1500,
        image: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        isOnline: false,
        ticketTypes: [
            { id: 'tt1', name: 'General Admission', price: 1500, quantity: 500 },
            { id: 'tt2', name: 'VIP', price: 3000, quantity: 100 }
        ],
        status: 'approved' // 'pending', 'approved', 'rejected'
    },
    {
        id: 'e2',
        title: 'Tech Summit Nepal',
        organizerId: '2',
        description: 'A gathering of tech enthusiasts, developers, and innovators.',
        category: 'Tech',
        date: '2024-12-28',
        time: '09:00',
        location: 'Online',
        price: 0,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        isOnline: true,
        onlineLink: 'https://zoom.us/j/123456789',
        ticketTypes: [
            { id: 'tt3', name: 'Free Pass', price: 0, quantity: 1000 }
        ],
        status: 'approved'
    },
    {
        id: 'e3',
        title: 'Marathon 2024',
        organizerId: '2',
        description: 'Run for health, run for fun.',
        category: 'Sports',
        date: '2025-01-10',
        time: '06:00',
        location: 'Patan Durbar Square',
        price: 500,
        image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        isOnline: false,
        ticketTypes: [
            { id: 'tt4', name: 'Participant', price: 500, quantity: 200 }
        ],
        status: 'pending' // For admin testing
    }
];

export const MOCK_TICKETS = [
    {
        id: 't1',
        eventId: 'e1',
        userId: '1',
        ticketTypeId: 'tt1',
        purchaseDate: '2024-12-10',
        status: 'valid', // 'valid', 'used', 'cancelled'
        qrCode: 'mock-qr-code-string'
    }
];
