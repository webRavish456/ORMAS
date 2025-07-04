import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  images: string[];
}

const eventsCollection = collection(db, 'events');

export const getEvents = async (): Promise<Event[]> => {
  const snapshot = await getDocs(eventsCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Event));
};

export const saveEvent = async (event: Omit<Event, 'id'>) => {
  const eventWithImages = {
    ...event,
    images: event.images || ['']
  };
  const docRef = await addDoc(eventsCollection, eventWithImages);
  return {
    id: docRef.id,
    ...eventWithImages
  };
};

export const updateEvent = async (id: string, updates: Omit<Event, 'id'>) => {
  const updatesWithImages = {
    ...updates,
    images: updates.images || ['']
  };
  const docRef = doc(db, 'events', id);
  await updateDoc(docRef, updatesWithImages);
  return {
    id,
    ...updatesWithImages
  };
};

export const deleteEvent = async (id: string) => {
  const docRef = doc(db, 'events', id);
  await deleteDoc(docRef);
};

export const getEventsByExhibition = async (exhibition: string): Promise<Event[]> => {
  const exhibitionEventsCollection = collection(db, `exhibitions/${exhibition}/events`);
  const snapshot = await getDocs(exhibitionEventsCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Event));
};

export const saveEventToExhibition = async (exhibition: string, event: Omit<Event, 'id'>) => {
  const eventWithImages = {
    ...event,
    images: event.images || ['']
  };
  const exhibitionEventsCollection = collection(db, `exhibitions/${exhibition}/events`);
  const docRef = await addDoc(exhibitionEventsCollection, eventWithImages);
  return {
    id: docRef.id,
    ...eventWithImages
  };
};

export const updateEventInExhibition = async (exhibition: string, id: string, updates: Omit<Event, 'id'>) => {
  const updatesWithImages = {
    ...updates,
    images: updates.images || ['']
  };
  const docRef = doc(db, `exhibitions/${exhibition}/events`, id);
  await updateDoc(docRef, updatesWithImages);
  return {
    id,
    ...updatesWithImages
  };
};

export const deleteEventFromExhibition = async (exhibition: string, id: string) => {
  const docRef = doc(db, `exhibitions/${exhibition}/events`, id);
  await deleteDoc(docRef);
};