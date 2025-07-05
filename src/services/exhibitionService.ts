import { db } from '../firebase/config';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export interface ExhibitionPhoto {
  id: string;
  url: string;
  caption?: string;
}

export interface Stall {
  id: string;
  row: number;
  column: number;
  stallNumber: string;
  type: 'participant' | 'utility';
  name?: string;
  description?: string;
  category?: string;
  utilityType?: 'restroom' | 'food' | 'information' | 'security' | 'medical' | 'storage' | 'other';
  capacity?: number;
  notes?: string;
  location?: {
    state: string;
    district: string;
    block: string;
  };
  products?: string[];
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const exhibitionCollection = collection(db, 'exhibitionPhotos');

export const getExhibitionPhotos = async (): Promise<ExhibitionPhoto[]> => {
  const snapshot = await getDocs(exhibitionCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ExhibitionPhoto));
};

export const saveExhibitionPhoto = async (photo: Omit<ExhibitionPhoto, 'id'>) => {
  const docRef = await addDoc(exhibitionCollection, photo);
  return {
    id: docRef.id,
    ...photo
  };
};

export const updateExhibitionPhoto = async (id: string, updates: Omit<ExhibitionPhoto, 'id'>) => {
  const docRef = doc(db, 'exhibitionPhotos', id);
  await updateDoc(docRef, updates);
  return {
    id,
    ...updates
  };
};

export const deleteExhibitionPhoto = async (id: string) => {
  const docRef = doc(db, 'exhibitionPhotos', id);
  await deleteDoc(docRef);
};

// Stall management functions
const stallsCollection = collection(db, 'stalls');

export const getExhibitionStalls = async (): Promise<Stall[]> => {
  try {
    const snapshot = await getDocs(stallsCollection);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function'
          ? data.createdAt.toDate()
          : (typeof data.createdAt === 'string' ? new Date(data.createdAt) : new Date()),
        updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function'
          ? data.updatedAt.toDate()
          : (typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : new Date()),
      } as Stall;
    });
  } catch (error) {
    console.error('Error fetching stalls:', error);
    return [];
  }
};

export const getExhibitionLayout = async () => {
  try {
    const stalls = await getExhibitionStalls();
    if (stalls.length === 0) {
      return { rows: 0, columns: 0, stalls: [], stats: { total: 0, participant: 0, utility: 0 } };
    }

    // Calculate dimensions from existing stalls
    const maxRow = Math.max(...stalls.map(s => s.row));
    const maxColumn = Math.max(...stalls.map(s => s.column));
    
    // Calculate statistics
    const participantCount = stalls.filter(s => s.type === 'participant').length;
    const utilityCount = stalls.filter(s => s.type === 'utility').length;
    
    return {
      rows: maxRow + 1,
      columns: maxColumn + 1,
      stalls,
      stats: {
        total: stalls.length,
        participant: participantCount,
        utility: utilityCount
      }
    };
  } catch (error) {
    console.error('Error fetching exhibition layout:', error);
    return { rows: 0, columns: 0, stalls: [], stats: { total: 0, participant: 0, utility: 0 } };
  }
}; 

export const getExhibitionStallsByExhibition = async (exhibition: string): Promise<Stall[]> => {
  try {
    const stallsCollection = collection(db, `exhibitions/${exhibition}/stalls`);
    const snapshot = await getDocs(stallsCollection);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function'
          ? data.createdAt.toDate()
          : (typeof data.createdAt === 'string' ? new Date(data.createdAt) : new Date()),
        updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function'
          ? data.updatedAt.toDate()
          : (typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : new Date()),
      } as Stall;
    });
  } catch (error) {
    console.error('Error fetching stalls:', error);
    return [];
  }
};

export const getExhibitionLayoutByExhibition = async (exhibition: string) => {
  try {
    const stalls = await getExhibitionStallsByExhibition(exhibition);
    if (stalls.length === 0) {
      return { rows: 0, columns: 0, stalls: [], stats: { total: 0, participant: 0, utility: 0 } };
    }

    // Calculate dimensions from existing stalls
    const maxRow = Math.max(...stalls.map(s => s.row));
    const maxColumn = Math.max(...stalls.map(s => s.column));
    
    // Calculate statistics
    const participantCount = stalls.filter(s => s.type === 'participant').length;
    const utilityCount = stalls.filter(s => s.type === 'utility').length;
    
    return {
      rows: maxRow + 1,
      columns: maxColumn + 1,
      stalls,
      stats: {
        total: stalls.length,
        participant: participantCount,
        utility: utilityCount
      }
    };
  } catch (error) {
    console.error('Error fetching exhibition layout:', error);
    return { rows: 0, columns: 0, stalls: [], stats: { total: 0, participant: 0, utility: 0 } };
  }
};

export const getExhibitionPhotosByExhibition = async (exhibition: string): Promise<ExhibitionPhoto[]> => {
  const exhibitionPhotosCollection = collection(db, `exhibitions/${exhibition}/exhibitionPhotos`);
  const snapshot = await getDocs(exhibitionPhotosCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ExhibitionPhoto));
};

export const saveExhibitionPhotoToExhibition = async (exhibition: string, photo: Omit<ExhibitionPhoto, 'id'>) => {
  const exhibitionPhotosCollection = collection(db, `exhibitions/${exhibition}/exhibitionPhotos`);
  const docRef = await addDoc(exhibitionPhotosCollection, photo);
  return {
    id: docRef.id,
    ...photo
  };
};

export const updateExhibitionPhotoInExhibition = async (exhibition: string, id: string, updates: Omit<ExhibitionPhoto, 'id'>) => {
  const docRef = doc(db, `exhibitions/${exhibition}/exhibitionPhotos`, id);
  await updateDoc(docRef, updates);
  return {
    id,
    ...updates
  };
};

export const deleteExhibitionPhotoFromExhibition = async (exhibition: string, id: string) => {
  const docRef = doc(db, `exhibitions/${exhibition}/exhibitionPhotos`, id);
  await deleteDoc(docRef);
}; 