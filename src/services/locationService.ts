
export interface LocationData {
  country: string;
  state: string;
  district: string;
  subDistrict?: string;
  village?: string;
  pincode?: string;
}

export interface ExhibitionLocation {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  facilities: string[];
  contactInfo: {
    phone?: string;
    email?: string;
  };
}

// Mock data for exhibition locations
const exhibitionLocations: ExhibitionLocation[] = [
  {
    id: 'main-venue',
    name: 'ORMAS Exhibition Center',
    address: 'Bhubaneswar, Odisha, India',
    coordinates: { lat: 20.2961, lng: 85.8245 },
    facilities: ['Parking', 'Food Court', 'Rest Areas', 'Handicraft Stalls', 'Cultural Stage'],
    contactInfo: {
      phone: '+91-674-XXXXXXX',
      email: 'info@ormasexhibition.org'
    }
  }
];

export const getExhibitionLocations = async (): Promise<ExhibitionLocation[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => resolve(exhibitionLocations), 500);
  });
};

export const getNearbyFacilities = async (locationId: string): Promise<string[]> => {
  const location = exhibitionLocations.find(loc => loc.id === locationId);
  return location?.facilities || [];
};

export const getLocationByPincode = async (pincode: string): Promise<LocationData | null> => {
  // This would typically connect to a real API
  // For now, return mock data for Odisha pincodes
  if (pincode.startsWith('751') || pincode.startsWith('752')) {
    return {
      country: 'India',
      state: 'Odisha',
      district: 'Khordha',
      subDistrict: 'Bhubaneswar',
      pincode
    };
  }
  
  return null;
};

export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

export const formatAddress = (location: LocationData): string => {
  const parts = [
    location.village,
    location.subDistrict,
    location.district,
    location.state,
    location.country,
    location.pincode
  ].filter(Boolean);
  
  return parts.join(', ');
};
