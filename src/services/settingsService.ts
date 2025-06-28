
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface ExhibitionSettings {
  marqueeMessages: string[];
  marqueeColor: string;
  marqueeSpeed: number;
  welcomeMessage: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
}

const defaultSettings: ExhibitionSettings = {
  marqueeMessages: ['Welcome to Odisha Tribal Exhibition 2024!'],
  marqueeColor: '#1e40af',
  marqueeSpeed: 5,
  welcomeMessage: 'Discover the rich heritage of Odisha tribal culture',
  contactInfo: {
    phone: '+91-1234567890',
    email: 'info@exhibition.com',
    address: '123 Exhibition Center, Bhubaneswar'
  }
};

export const getExhibitionSettings = async (): Promise<ExhibitionSettings> => {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'exhibition'));
    if (settingsDoc.exists()) {
      return settingsDoc.data() as ExhibitionSettings;
    }
    return defaultSettings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return defaultSettings;
  }
};

export const updateExhibitionSettings = async (settings: ExhibitionSettings): Promise<void> => {
  try {
    await setDoc(doc(db, 'settings', 'exhibition'), settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};
