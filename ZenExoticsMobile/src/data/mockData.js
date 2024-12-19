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
  status: 'Pending',
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

const mockBookingDetails = {
  'bk1': sharedBookingDetails,
  '1234': { ...sharedBookingDetails, id: 'bk2' }, // Use same properties but override ID
  '5678': { ...sharedBookingDetails, id: 'bk3' },
  '91011': { ...sharedBookingDetails, id: 'bk3' },
  '91012': { ...sharedBookingDetails, id: 'bk3' },
  // Add more mock booking details for other IDs...
};

export const fetchBookingDetails = (bookingId) => {
  console.log("fetchBookingDetails", bookingId);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const bookingDetails = mockBookingDetails[bookingId];
      if (bookingDetails) {
        resolve(bookingDetails);
      } else {
        reject(new Error('Booking not found'));
      }
    }, 1000);
  });
};