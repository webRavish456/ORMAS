import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Product {
  id: string;
  category: string;
  name: string;
  images: string[];
  stallRange?: string;
}

export const categories = [
  'Handloom',
  'Handicraft',
  'Minor Forest Products (MFP)',
  'Food & Spices',
  'Home Furnishing',
  'Woolen Knit Wear',
  'Leather Products',
  'Jewellery'
];

const productsCollection = collection(db, 'products');

export const getProducts = async (): Promise<Product[]> => {
  const snapshot = await getDocs(productsCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product));
};

export const saveProduct = async (product: Omit<Product, 'id'>) => {
  const docRef = await addDoc(productsCollection, product);
  return {
    id: docRef.id,
    ...product
  };
};

export const updateProduct = async (id: string, updates: Omit<Product, 'id'>) => {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, updates);
  return {
    id,
    ...updates
  };
};

export const deleteProduct = async (id: string) => {
  const docRef = doc(db, 'products', id);
  await deleteDoc(docRef);
};

export const getProductsByExhibition = async (exhibition: string): Promise<Product[]> => {
  const exhibitionProductsCollection = collection(db, `exhibitions/${exhibition}/products`);
  const snapshot = await getDocs(exhibitionProductsCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product));
};

export const saveProductToExhibition = async (exhibition: string, product: Omit<Product, 'id'>) => {
  const exhibitionProductsCollection = collection(db, `exhibitions/${exhibition}/products`);
  const docRef = await addDoc(exhibitionProductsCollection, product);
  return {
    id: docRef.id,
    ...product
  };
};

export const updateProductInExhibition = async (exhibition: string, id: string, updates: Omit<Product, 'id'>) => {
  const docRef = doc(db, `exhibitions/${exhibition}/products`, id);
  await updateDoc(docRef, updates);
  return {
    id,
    ...updates
  };
};

export const deleteProductFromExhibition = async (exhibition: string, id: string) => {
  const docRef = doc(db, `exhibitions/${exhibition}/products`, id);
  await deleteDoc(docRef);
};