// First, declare the BOOKING_STATES constant
export const BOOKING_STATES = {
  PENDING_INITIAL_PROFESSIONAL_CHANGES: 'Pending Initial Professional Changes',
  PENDING_PROFESSIONAL_CHANGES: 'Pending Professional Changes',
  PENDING_CLIENT_APPROVAL: 'Pending Client Approval',
  CONFIRMED_PENDING_PROFESSIONAL_CHANGES: 'Confirmed Pending Professional Changes',
  CONFIRMED: 'Confirmed',
  DENIED: 'Denied',
  CANCELLED: 'Cancelled'
};

export const ALL_SERVICES = "All Services";
export const SERVICE_TYPES = [
  ALL_SERVICES,
  "Overnight Cat Sitting (Client's Home)",
  "Cat Boarding",
  "Drop-In Visits (30 min)",
  "Drop-In Visits (60 min)",
  "Dog Walking",
  "Doggy Day Care",
  "Pet Boarding",
  "Exotic Pet Care",
  "Daytime Pet Sitting",
  "Ferrier",
];

export const TIME_OPTIONS = [
  '15 min',
  '30 min',
  '45 min',
  '1 hr',
  '2 hr',
  '4 hr',
  '8 hr',
  '24 hr',
  'overnight',
  'per day',
  'per visit'
];

export const mockAdditionalRates = {
  'Dog Boarding': [
    { title: 'Extended Stay (7+ days)', amount: 15 },
    { title: 'Pickup/Dropoff Service', amount: 25 },
    { title: 'Special Diet Handling', amount: 10 },
    { title: 'Medication Administration', amount: 15 },
  ],
  'Doggy Day Care': [
    { title: 'Extended Hours', amount: 20 },
    { title: 'Training Session', amount: 30 },
    { title: 'Grooming', amount: 25 },
  ],
  'House Sitting': [
    { title: 'Plant Watering', amount: 10 },
    { title: 'Mail Collection', amount: 5 },
    { title: 'Extended Visit (4+ hrs)', amount: 30 },
  ],
  'Drop-In Visits': [
    { title: 'Extra 15 Minutes', amount: 10 },
    { title: 'Plant Watering', amount: 5 },
    { title: 'Photo Updates', amount: 5 },
  ],
  'Dog Walking': [
    { title: 'Extra 15 Minutes', amount: 10 },
    { title: 'Multiple Route Options', amount: 5 },
    { title: 'Training During Walk', amount: 20 },
  ],
};

export const mockServicesForCards = [
  {
    id: 1,
    name: 'Dog Boarding',
    startingPrice: 25,
    animalTypes: ['Dogs'],
    icon: 'dog',
    additionalRates: mockAdditionalRates['Dog Boarding']
  },
  {
    id: 2,
    name: 'Doggy Day Care',
    startingPrice: 30,
    animalTypes: ['Dogs'],
    icon: 'dog',
    additionalRates: mockAdditionalRates['Doggy Day Care']
  },
  {
    id: 3,
    name: 'House Sitting',
    startingPrice: 40,
    animalTypes: ['Dogs', 'Cats', 'Small Pets'],
    icon: 'home',
    additionalRates: mockAdditionalRates['House Sitting']
  },
  {
    id: 4,
    name: 'Drop-In Visits',
    startingPrice: 35,
    animalTypes: ['Cats', 'Small Pets'],
    icon: 'door',
    additionalRates: mockAdditionalRates['Drop-In Visits']
  },
  {
    id: 5,
    name: 'Dog Walking',
    startingPrice: 45,
    animalTypes: ['Dogs'],
    icon: 'walk',
    additionalRates: mockAdditionalRates['Dog Walking']
  }
];

export const GENERAL_CATEGORIES = [
  'Farm Animals', 
  'Domestic',
  'Exotic',
  'Aquatic',
  'Invertibrates',
];

export const mockPets = [
  {
    id: '1',
    name: 'Max',
    animal_type: 'Dog',
    breed: 'border collie',
    age: {
      months: 0,
      years: 5,
    },
    weight: 32,
    sex: 'Male',
    friendlyWithChildren: true,
    friendlyWithCats: false,
    friendlyWithDogs: true,
    spayedNeutered: true,
    houseTrained: true,
    microchipped: true,
    adoptionDate: '2020-01-15',
    description: 'Loves to play fetch and go for walks.',
    energyLevel: 'High',
    feedingSchedule: 'Morning',
    leftAlone: '1-4 hours',
    medication: null,
    additionalInstructions: 'Needs daily exercise.',
    vetName: 'Dr. Smith',
    vetAddress: '123 Vet St.',
    vetPhone: '555-1234',
    insuranceProvider: 'Pet Insurance Co.',
    vetDocuments: [],
    galleryImages: [],
  },
  {
    id: '2',
    name: 'Whiskers',
    animal_type: 'Cat',
    breed: 'tammy ammy',
    age: {
      months: 3,
      years: 4,
    },
    weight: 16,
    sex: 'Female',
    friendlyWithChildren: true,
    friendlyWithCats: true,
    friendlyWithDogs: false,
    spayedNeutered: true,
    houseTrained: true,
    microchipped: false,
    adoptionDate: '2019-05-20',
    description: 'Enjoys lounging in the sun.',
    energyLevel: 'Low',
    feedingSchedule: 'Twice a day',
    leftAlone: '4-8 hours',
    medication: null,
    additionalInstructions: 'Prefers quiet environments.',
    vetName: 'Dr. Jones',
    vetAddress: '456 Vet Ave.',
    vetPhone: '555-5678',
    insuranceProvider: 'Pet Health Insurance',
    vetDocuments: [],
    galleryImages: [],
  },
  {
    id: '3',
    name: 'Buddy',
    animal_type: 'Lizard',
    breed: 'leopard gecko',
    age: {
      months: 0,
      years: 2,
    },
    weight: 1,
    sex: 'Male',
    friendlyWithChildren: false,
    friendlyWithCats: false,
    friendlyWithDogs: false,
    spayedNeutered: false,
    houseTrained: false,
    microchipped: false,
    adoptionDate: '2021-08-10',
    description: 'A calm and quiet pet.',
    energyLevel: 'Low',
    feedingSchedule: ['Custom', '3 times a day with liquid food.'],
    leftAlone: 'Can be left alone indefinitely',
    medication: null,
    additionalInstructions: 'Keep in a warm environment.',
    vetName: 'Dr. Green',
    vetAddress: '789 Vet Blvd.',
    vetPhone: '555-9012',
    insuranceProvider: 'Reptile Insurance Co.',
    vetDocuments: [],
    galleryImages: [],
  },
];

export const mockSitters = [
  {
    id: '1',
    name: 'John Doe',
    profilePicture: 'https://via.placeholder.com/150',
    reviews: 4.5,
    price: 25,
    bio: 'Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.Experienced with all types of pets.',
    location: 'Colorado Springs, CO',
    coordinates: { latitude: 38.8339, longitude: -104.8214 },
    serviceTypes: ['House Sitting', 'Dog Walking'],
    animalTypes: ['dogs', 'cats'],
  },
  {
    id: '2',
    name: 'Jane Smith',
    profilePicture: 'https://via.placeholder.com/150',
    reviews: 4.8,
    price: 30,
    bio: 'Specialized in exotic pets.',
    location: 'Manitou Springs, CO',
    coordinates: { latitude: 38.8597, longitude: -104.9172 },
    serviceTypes: ['House Sitting', 'Drop-ins'],
    animalTypes: ['exotics', 'cats'],
  },
  {
    id: '3',
    name: 'Mike Wilson',
    profilePicture: 'https://via.placeholder.com/150',
    reviews: 4.7,
    price: 28,
    bio: 'Dog trainer with 5 years experience.',
    location: 'Security-Widefield, CO',
    coordinates: { latitude: 38.7478, longitude: -104.7288 },
    serviceTypes: ['Dog Walking', 'Training'],
    animalTypes: ['dogs'],
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    profilePicture: 'https://via.placeholder.com/150',
    reviews: 4.9,
    price: 35,
    bio: 'Veterinary technician, great with medical needs.',
    location: 'Fountain, CO',
    coordinates: { latitude: 38.6822, longitude: -104.7008 },
    serviceTypes: ['House Sitting', 'Drop-ins'],
    animalTypes: ['dogs', 'cats', 'exotics'],
  },
  {
    id: '5',
    name: 'Tom Brown',
    profilePicture: 'https://via.placeholder.com/150',
    reviews: 4.6,
    price: 27,
    bio: 'Experienced with large breeds.',
    location: 'Black Forest, CO',
    coordinates: { latitude: 39.0128, longitude: -104.7008 },
    serviceTypes: ['Dog Walking', 'House Sitting'],
    animalTypes: ['dogs'],
  },
  // Additional sitters further out
  {
    id: '6',
    name: 'Lisa Anderson',
    profilePicture: 'https://via.placeholder.com/150',
    reviews: 4.4,
    price: 32,
    bio: 'Experienced with birds and small animals.',
    location: 'Monument, CO',
    coordinates: { latitude: 39.0917, longitude: -104.8722 },
    serviceTypes: ['House Sitting', 'Drop-ins'],
    animalTypes: ['exotics', 'cats'],
  },
  {
    id: '7',
    name: 'David Clark',
    profilePicture: 'https://via.placeholder.com/150',
    reviews: 4.7,
    price: 29,
    bio: 'Specializing in puppy care and training.',
    location: 'Woodland Park, CO',
    coordinates: { latitude: 38.9939, longitude: -105.0569 },
    serviceTypes: ['Dog Walking', 'Training'],
    animalTypes: ['dogs'],
  },
  {
    id: '8',
    name: 'Emma White',
    profilePicture: 'https://via.placeholder.com/150',
    reviews: 4.8,
    price: 33,
    bio: 'Experienced with senior pets.',
    location: 'Pueblo West, CO',
    coordinates: { latitude: 38.3494, longitude: -104.7224 },
    serviceTypes: ['House Sitting', 'Drop-ins'],
    animalTypes: ['dogs', 'cats'],
  },
  {
    id: '9',
    name: 'James Miller',
    profilePicture: 'https://via.placeholder.com/150',
    reviews: 4.5,
    price: 26,
    bio: 'Great with high-energy dogs.',
    location: 'Castle Rock, CO',
    coordinates: { latitude: 39.3722, longitude: -104.8561 },
    serviceTypes: ['Dog Walking', 'House Sitting'],
    animalTypes: ['dogs'],
  },
  {
    id: '10',
    name: 'Rachel Green',
    profilePicture: 'https://via.placeholder.com/150',
    reviews: 4.9,
    price: 34,
    bio: 'Experienced with reptiles and amphibians.',
    location: 'Palmer Lake, CO',
    coordinates: { latitude: 39.1153, longitude: -104.9158 },
    serviceTypes: ['House Sitting', 'Drop-ins'],
    animalTypes: ['exotics'],
  }
];

export const mockClients = [
  {
    id: '1',
    name: 'Alice Johnson',
    pet_types: ['Dog', 'Cat'],
    last_booking: '2024-01-15',
    pets: ['1', '2'], // References to pet IDs
    email: 'alice@example.com',
    phone: '555-0101',
    address: '123 Pine St, Colorado Springs, CO',
  },
  {
    id: '2',
    name: 'Bob Wilson',
    pet_types: ['Dog'],
    last_booking: '2024-02-01',
    pets: ['3'],
    email: 'bob@example.com',
    phone: '555-0102',
    address: '456 Oak Ave, Colorado Springs, CO',
  },
  {
    id: '3',
    name: 'Carol Martinez',
    pet_types: ['Cat', 'Exotic'],
    last_booking: '2024-01-28',
    pets: ['4', '5'],
    email: 'carol@example.com',
    phone: '555-0103',
    address: '789 Maple Dr, Colorado Springs, CO',
  },
  {
    id: '4',
    name: 'David Brown',
    pet_types: ['Dog'],
    last_booking: '2024-02-05',
    pets: ['6'],
    email: 'david@example.com',
    phone: '555-0104',
    address: '321 Elm St, Colorado Springs, CO',
  },
  {
    id: '5',
    name: 'Eva Garcia',
    pet_types: ['Exotic'],
    last_booking: '2024-01-20',
    pets: ['7'],
    email: 'eva@example.com',
    phone: '555-0105',
    address: '654 Birch Ln, Colorado Springs, CO',
  }
];

// Availability Tab
export const fetchAvailabilityData = () => {
  console.log("fetchAvailabilityData");
  return new Promise((resolve) => {
    // to get the bookings, we need to fetch the booking table on backend
    // to get available/unavailable dates we need to fetch the availability table on backend
    setTimeout(() => {
      resolve({
        availableDates: {
          '2024-12-01': { startTime: '09:00', endTime: '17:00' },
          '2024-12-02': { startTime: '10:00', endTime: '18:00' },
          '2024-12-03': { startTime: '09:00', endTime: '17:00' },
        },
        unavailableDates: {
          '2024-12-04': { startTime: '00:00', endTime: '24:00' },
          '2024-12-05': { startTime: '10:00', endTime: '18:00' },
        },
        bookings: {
          '2024-12-06': [
            { id: 'bk1', startTime: '14:00', endTime: '16:00', client_name: 'Charlie' },
            { id: 'bk2', startTime: '16:00', endTime: '18:00', client_name: 'Bob' },
            { id: 'bk3', startTime: '18:00', endTime: '20:00', client_name: 'Nick' },
            { id: 'bk4', startTime: '20:00', endTime: '22:00', client_name: 'Alfred' }
          ],
          '2024-12-07': [
            { id: 'bk5', startTime: '10:00', endTime: '12:00', client_name: 'Uhtred' }
          ],
        },
      });
    }, 1000);
  });
};

// Add mock update functions
export const updateAvailability = (updates) => {
  console.log("updateAvailability", updates);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: updates });
    }, 500);
  });
};

export const updateBooking = (bookingData) => {
  console.log("updateBooking", bookingData);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: bookingData });
    }, 500);
  });
};

const sharedBookingDetails = {
  id: 'bk1',
  status: 'Pending Professional Changes',
  startDate: '2024-12-06',
  startTime: '14:00',
  endDate: '2024-12-06',
  endTime: '16:00',
  clientName: 'Charlie Bootylicker',
  professionalName: 'Sarah Wilson',
  serviceType: 'Dog Walking',
  animalType: 'Dog',
  numberOfPets: 2,
  duration: 2,
  occurrences: [
    {
      id: 'occ1',
      startDate: '2024-12-06',
      endDate: '2024-12-06',
      startTime: '14:00',
      endTime: '16:00',
      rates: {
        baseRate: 20.00,
        additionalRates: [
          { name: 'Weekend Fee', amount: 5.00 },
          { name: 'Premium Package', amount: 10.00 }
        ]
      },
      totalCost: 35.00
    },
    {
      id: 'occ2',
      startDate: '2024-12-07',
      endDate: '2024-12-07',
      startTime: '14:00',
      endTime: '16:00',
      rates: {
        baseRate: 20.00,
        additionalRates: [
          { name: 'Weekend Fee', amount: 5.00 }
        ]
      },
      totalCost: 25.00
    }
  ],
  rates: {
    baseRate: 20.00,
    additionalPetRate: 5.00,
    extraServices: [
      { name: 'Premium Package', amount: 10.00 },
      { name: 'Weekend Fee', amount: 5.00 }
    ]
  },
  costs: {
    baseTotal: 80.00,
    additionalPetTotal: 5.00,
    extraServicesTotal: 15.00,
    subtotal: 100.00,
    clientFee: 10.00,
    taxes: 9.00,
    totalClientCost: 119.00,
    professionalPayout: 90.00,
  },
};

// Initialize mockBookingDetails with existing mock data
const mockBookingDetails = {
  '1234': {
    ...sharedBookingDetails,
    id: '1234',
    clientName: 'John Doe',
    status: BOOKING_STATES.CONFIRMED,
    startDate: '2024-02-20',
    startTime: '14:00',
  },
  '5678': {
    ...sharedBookingDetails,
    id: '5678',
    clientName: 'Margarett Laporte',
    status: BOOKING_STATES.CANCELLED,
    startDate: '2024-02-21',
    startTime: '15:30',
  },
  '56782': {
    ...sharedBookingDetails,
    id: '56782',
    clientName: 'Zoe Neale',
    status: BOOKING_STATES.DENIED,
    startDate: '2024-02-21',
    startTime: '15:30',
  },
  '5673': {
    ...sharedBookingDetails,
    id: '5673',
    clientName: 'Matt Aertker',
    status: BOOKING_STATES.PENDING_INITIAL_PROFESSIONAL_CHANGES,
    startDate: '2024-02-21',
    startTime: '15:30',
  },
  '5674': {
    ...sharedBookingDetails,
    id: '5674',
    clientName: 'Mark Smith',
    status: BOOKING_STATES.PENDING_CLIENT_APPROVAL,
    startDate: '2024-02-21',
    startTime: '15:30',
  },
  '5675': {
    ...sharedBookingDetails,
    id: '5675',
    clientName: 'Booty Smith',
    status: BOOKING_STATES.PENDING_PROFESSIONAL_CHANGES,
    startDate: '2024-02-21',
    startTime: '15:30',
  },
  '5675': {
    ...sharedBookingDetails,
    id: '56712',
    clientName: 'Booty Butt Licker',
    status: BOOKING_STATES.CONFIRMED_PENDING_PROFESSIONAL_CHANGES,
    startDate: '2024-02-21',
    startTime: '15:30',
  },
};

// Map mockProfessionalBookings from mockBookingDetails
export const mockProfessionalBookings = Object.values(mockBookingDetails)
  .map(booking => ({
    id: booking.id,
    clientName: booking.clientName,
    status: booking.status,
    date: booking.startDate,
    time: booking.startTime,
  }));

// Add the createBooking function
export const createBooking = async (clientId, freelancerId, initialData = {}) => {
  const newBookingId = Math.floor(Math.random() * 10000).toString();
  
  const blankBooking = {
    id: newBookingId,
    status: 'Pending Initial Professional Changes',
    clientId,
    freelancerId,
    clientName: initialData.clientName || 'TBD',
    professionalName: initialData.professionalName || 'TBD',
    serviceType: initialData.serviceType || 'TBD',
    animalType: initialData.animalType || 'TBD',
    numberOfPets: initialData.numberOfPets || 0,
    duration: initialData.duration || 0,
    occurrences: initialData.occurrences || [],
    rates: {
      baseRate: 0,
      additionalPetRate: 0,
      extraServices: []
    },
    costs: {
      baseTotal: 0,
      additionalPetTotal: 0,
      extraServicesTotal: 0,
      subtotal: 0,
      clientFee: 0,
      taxes: 0,
      totalClientCost: 0,
      professionalPayout: 0
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...initialData
  };

  // Add to mock database
  mockBookingDetails[newBookingId] = blankBooking;
  console.log('Created new booking:', newBookingId, mockBookingDetails[newBookingId]);

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return newBookingId;
};

// Update fetchBookingDetails to handle missing bookings better and add logging
export const fetchBookingDetails = async (bookingId) => {
  console.log("Fetching booking details for ID:", bookingId);
  console.log("Available bookings:", Object.keys(mockBookingDetails));
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const bookingDetails = mockBookingDetails[bookingId];
  if (!bookingDetails) {
    console.error(`Booking not found for ID: ${bookingId}`);
    throw new Error('Booking not found');
  }
  
  return bookingDetails;
};

// Export mockBookingDetails for debugging
export const _mockBookingDetails = mockBookingDetails;

// Add new mock function for updating booking status
export const updateBookingStatus = async (bookingId, newStatus, reason = '', metadata = {}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (!mockBookingDetails[bookingId]) {
    throw new Error('Booking not found');
  }
  
  mockBookingDetails[bookingId] = {
    ...mockBookingDetails[bookingId],
    status: newStatus,
    statusReason: reason,
    updated_at: new Date().toISOString(),
    ...metadata
  };
  
  return mockBookingDetails[bookingId];
};

// Make sure to update MyBookings.js to use the same BOOKING_STATES constant
export const mockClientBookings = [
  {
    id: '91011',
    professionalName: 'Sarah Wilson',
    status: BOOKING_STATES.CONFIRMED,
    date: '2024-02-22',
    time: '10:00',
  },
  {
    id: '91012',
    professionalName: 'Mike Johnson',
    status: BOOKING_STATES.PENDING_CLIENT_APPROVAL,
    date: '2024-02-23',
    time: '11:00',
  },
];

// Assuming current user ID is 101 for testing
export const CURRENT_USER_ID = 101;

export const mockConversations = [
  {
    id: 'conv_1',
    participant1_id: CURRENT_USER_ID,
    participant2_id: 202,
    name: "Dr. Sarah Smith",
    role_map: {
      participant1_role: "client",
      participant2_role: "professional"
    },
    lastMessage: "I'd be happy to help! What kind of pet do you have?",
    timestamp: "2024-02-21T07:05:00Z",
    unread: false
  },
  {
    id: 'conv_2',
    participant1_id: 203,
    participant2_id: CURRENT_USER_ID,
    name: "Dr. Mike Johnson",
    role_map: {
      participant1_role: "client",
      participant2_role: "professional"
    },
    lastMessage: "I'm available! Let's set up a booking",
    timestamp: "2024-02-21T15:35:00Z",
    unread: false
  },
  {
    id: 'conv_3',
    participant1_id: CURRENT_USER_ID,
    participant2_id: 204,
    name: "Dr. Emily Wilson",
    role_map: {
      participant1_role: "client",
      participant2_role: "professional"
    },
    lastMessage: "Your cat's checkup is scheduled",
    timestamp: "2024-02-20T10:15:00Z",
    unread: true
  },
  {
    id: 'conv_4',
    participant1_id: CURRENT_USER_ID,
    participant2_id: 205,
    name: "Dr. James Anderson",
    role_map: {
      participant1_role: "client",
      participant2_role: "professional"
    },
    lastMessage: "See you tomorrow at 2 PM",
    timestamp: "2024-02-19T16:45:00Z",
    unread: false
  },
  {
    id: 'conv_5',
    participant1_id: CURRENT_USER_ID,
    participant2_id: 206,
    name: "Dr. Lisa Brown",
    role_map: {
      participant1_role: "client",
      participant2_role: "professional"
    },
    lastMessage: "How is Max doing today?",
    timestamp: "2024-02-18T09:30:00Z",
    unread: false
  },
  {
    id: 'conv_6',
    participant1_id: CURRENT_USER_ID,
    participant2_id: 207,
    name: "Dr. Robert Taylor",
    role_map: {
      participant1_role: "client",
      participant2_role: "professional"
    },
    lastMessage: "The medication has been prescribed",
    timestamp: "2024-02-17T14:20:00Z",
    unread: false
  },
  {
    id: 'conv_7',
    participant1_id: CURRENT_USER_ID,
    participant2_id: 208,
    name: "Dr. Maria Garcia",
    role_map: {
      participant1_role: "client",
      participant2_role: "professional"
    },
    lastMessage: "Your appointment is confirmed",
    timestamp: "2024-02-16T11:25:00Z",
    unread: true
  },
  {
    id: 'conv_8',
    participant1_id: CURRENT_USER_ID,
    participant2_id: 209,
    name: "Dr. David Lee",
    role_map: {
      participant1_role: "client",
      participant2_role: "professional"
    },
    lastMessage: "Let's schedule a follow-up",
    timestamp: "2024-02-15T13:40:00Z",
    unread: false
  },
  {
    id: 'conv_9',
    participant1_id: CURRENT_USER_ID,
    participant2_id: 210,
    name: "Dr. Sarah Martinez",
    role_map: {
      participant1_role: "client",
      participant2_role: "professional"
    },
    lastMessage: "The test results are ready",
    timestamp: "2024-02-14T15:55:00Z",
    unread: false
  },
  {
    id: 'conv_10',
    participant1_id: CURRENT_USER_ID,
    participant2_id: 211,
    name: "Dr. John White",
    role_map: {
      participant1_role: "client",
      participant2_role: "professional"
    },
    lastMessage: "How's the new diet working?",
    timestamp: "2024-02-13T08:15:00Z",
    unread: false
  },
  {
    id: 'conv_11',
    participant1_id: CURRENT_USER_ID,
    participant2_id: 212,
    name: "Dr. Anna Clark",
    role_map: {
      participant1_role: "client",
      participant2_role: "professional"
    },
    lastMessage: "Vaccination reminder",
    timestamp: "2024-02-12T10:30:00Z",
    unread: true
  },
  {
    id: 'conv_12',
    participant1_id: CURRENT_USER_ID,
    participant2_id: 213,
    name: "Dr. Thomas Wright",
    role_map: {
      participant1_role: "client",
      participant2_role: "professional"
    },
    lastMessage: "Surgery scheduled for next week",
    timestamp: "2024-02-11T12:45:00Z",
    unread: false
  },
  {
    id: 'conv_13',
    participant1_id: CURRENT_USER_ID,
    participant2_id: 214,
    name: "Dr. Patricia Moore",
    role_map: {
      participant1_role: "client",
      participant2_role: "professional"
    },
    lastMessage: "Emergency consultation available",
    timestamp: "2024-02-10T17:20:00Z",
    unread: false
  },
  {
    id: 'conv_14',
    participant1_id: CURRENT_USER_ID,
    participant2_id: 215,
    name: "Dr. Kevin Hall",
    role_map: {
      participant1_role: "client",
      participant2_role: "professional"
    },
    lastMessage: "Treatment plan updated",
    timestamp: "2024-02-09T14:10:00Z",
    unread: false
  },
  {
    id: 'conv_15',
    participant1_id: CURRENT_USER_ID,
    participant2_id: 216,
    name: "Dr. Rachel Green",
    role_map: {
      participant1_role: "client",
      participant2_role: "professional"
    },
    lastMessage: "Prescription ready for pickup",
    timestamp: "2024-02-08T16:35:00Z",
    unread: true
  }
];

export const mockMessages = {
  'conv_1': [
    {
      message_id: 1,
      participant1_id: CURRENT_USER_ID,
      participant2_id: 202,
      sender: CURRENT_USER_ID,
      role_map: {
        participant1_role: "client",
        participant2_role: "professional"
      },
      content: "Hi, I'm interested in your pet sitting services",
      timestamp: "2024-02-21T14:00:00Z",
      booking_id: null,
      status: "read",
      is_booking_request: false,
      metadata: {}
    },
    {
      message_id: 2,
      participant1_id: CURRENT_USER_ID,
      participant2_id: 202,
      sender: 202,
      role_map: {
        participant1_role: "client",
        participant2_role: "professional"
      },
      content: "I'd be happy to help! What kind of pet do you have?",
      timestamp: "2024-02-21T14:05:00Z",
      booking_id: null,
      status: "sent",
      is_booking_request: false,
      metadata: {}
    }
  ],
  'conv_2': [
    {
      message_id: 3,
      participant1_id: 303,
      participant2_id: CURRENT_USER_ID,
      sender: 303,
      role_map: {
        participant1_role: "client",
        participant2_role: "professional"
      },
      content: "Looking for a dog walker next week",
      timestamp: "2024-02-21T15:30:00Z",
      booking_id: null,
      status: "read",
      is_booking_request: false,
      metadata: {}
    },
    {
      message_id: 4,
      participant1_id: 303,
      participant2_id: CURRENT_USER_ID,
      sender: CURRENT_USER_ID,
      role_map: {
        participant1_role: "client",
        participant2_role: "professional"
      },
      content: "I'm available! Let's set up a booking",
      timestamp: "2024-02-21T15:35:00Z",
      booking_id: "booking_123",
      status: "sent",
      is_booking_request: true,
      metadata: {
        booking_type: "dog_walking",
        rate: 30,
        duration: 60
      }
    }
  ]
};

// Helper function to create a new conversation
export const createNewConversation = (professionalId, professionalName, clientId, clientName) => {
  const conversationId = `conv_${Date.now()}`;
  const isCurrentUserClient = clientId === CURRENT_USER_ID;
  
  return {
    id: conversationId,
    participant1_id: isCurrentUserClient ? clientId : professionalId,
    participant2_id: isCurrentUserClient ? professionalId : clientId,
    role_map: {
      participant1_role: isCurrentUserClient ? "client" : "professional",
      participant2_role: isCurrentUserClient ? "professional" : "client"
    },
    lastMessage: "",
    timestamp: new Date().toISOString(),
    unread: false,
    bookingStatus: null
  };
};

export const DEFAULT_SERVICES = [
  {
    serviceName: 'Dog Walking',
    animalTypes: 'Dogs',
    rates: { base_rate: '20' },
    additionalAnimalRate: '10',
  },
  {
    serviceName: 'Cat Sitting',
    animalTypes: 'Cats',
    rates: { base_rate: '20' },
    additionalAnimalRate: '5',
  },
  {
    serviceName: 'Exotic Pet Care',
    animalTypes: 'Lizards, Birds',
    rates: { base_rate: '25' },
    additionalAnimalRate: '15',
  },
];

export const SERVICE_TYPE_SUGGESTIONS = [
  "Overnight Cat Sitting (Client's Home)",
  "Cat Boarding",
  "Drop-In Visits (30 min)",
  "Drop-In Visits (60 min)",
  "Dog Walking",
  "Doggy Day Care",
  "Pet Boarding",
  "Exotic Pet Care",
  "Daytime Pet Sitting",
  "Ferrier", 
];

export const ANIMAL_TYPE_SUGGESTIONS = [
  'Dog',
  'Cat',
  'Cow',
  'Calf',
  'Lizard',
  'Bird',
  'Rabbit',
  'Fish',
];