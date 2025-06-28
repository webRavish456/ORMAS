
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

export interface FeedbackResponse {
  question: string;
  answer: string;
}

export interface FeedbackEntry {
  id: string;
  timestamp: string;
  name: string;
  gender: string;
  email: string;
  mobile: string;
  location: string;
  areaOfInterest: string;
  responses: FeedbackResponse[];
  additionalFeedback?: string;
  discountCode?: string;
  assignedStall?: string;
}

export const submitFeedback = async (feedbackData: Omit<FeedbackEntry, 'id' | 'timestamp'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'feedback'), {
      ...feedbackData,
      timestamp: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

export const getFeedbackData = async (): Promise<FeedbackEntry[]> => {
  try {
    const q = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FeedbackEntry));
  } catch (error) {
    console.error('Error fetching feedback data:', error);
    throw error;
  }
};

export const generateDiscountCode = (stallNumbers: string[]): { code: string; stall: string } => {
  const stall = stallNumbers[Math.floor(Math.random() * stallNumbers.length)];
  const code = `DISC${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  return { code, stall };
};
