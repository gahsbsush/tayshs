/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc,
  serverTimestamp, 
  query, 
  orderBy,
  limit,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Define Operation types according to Firebase guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  link: string;
  buttonText?: string;
  updatedAt?: any;
  expiresAt?: string; // ISO string representing expiration time
  imageMode?: string; // 'cover' | 'contain' | 'natural'
}

export interface AdRequest {
  id: string;
  name: string;
  contact: string;
  description: string;
  timestamp?: any;
}

// Check if Firebase is fully initialized with real project configurations
export const isFirebaseConfigured = (): boolean => {
  return (
    firebaseConfig && 
    firebaseConfig.apiKey && 
    !firebaseConfig.apiKey.includes('placeholder') &&
    firebaseConfig.projectId !== 'mock-project'
  );
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Strict Firestore error handler as mandated by architectural Guidelines
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Fallback Mock Active Ad (Hand-crafted beautiful advertisements for local runtime)
export const DEFAULT_ADS: Ad[] = [
  {
    id: 'shiraz-carpet',
    title: 'گالری فرش اصيل دستباف شیراز',
    description: 'هم‌ساز با فصل بهار و خزان، زیباترین قالی‌ها و فرش‌های دستباف اصفهان و شیراز با رنگ‌های گیاهی و نقشه‌های اصیل ایرانی را به خانه خود ببرید.',
    imageUrl: 'https://images.unsplash.com/photo-1543248939-ff40856f65d4?auto=format&fit=crop&q=80&w=600',
    link: 'https://example.com/persian_carpets_shiraz',
    buttonText: 'کشف طرح‌های نو و باستانی'
  },
  {
    id: 'organic-tea',
    title: 'چای بهاره مزارع لاهیجان',
    description: 'صد در صد خالص، چیده شده با دست از مزارع مه‌آلود گیلان. بدون هیچ‌گونه طعم‌دهنده صنعتی یا مواد نگهدارنده. طعم اصیل سلامتی مزارع شمال کشور.',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600',
    link: 'https://example.com/organic_lahijan_tea',
    buttonText: 'خرید مستقیم از مزارع سبز'
  }
];

// Local state fallbacks in localStorage to support un-configured Firebase environments safely
const LOCAL_ADS_KEY = 'calendar_offline_ads';
const LOCAL_REQUESTS_KEY = 'calendar_offline_ad_requests';

// Get and Save Local fallbacks
const getLocalAds = (): Ad[] => {
  const stored = localStorage.getItem(LOCAL_ADS_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_ADS_KEY, JSON.stringify(DEFAULT_ADS));
    return DEFAULT_ADS;
  }
  return JSON.parse(stored);
};

const getLocalAdRequests = (): AdRequest[] => {
  const stored = localStorage.getItem(LOCAL_REQUESTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveLocalAdRequest = (req: AdRequest) => {
  const list = getLocalAdRequests();
  list.unshift({
    ...req,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(list));
};

const saveLocalAd = (ad: Ad) => {
  const list = getLocalAds();
  const index = list.findIndex(item => item.id === ad.id);
  if (index !== -1) {
    list[index] = ad;
  } else {
    list.unshift(ad);
  }
  localStorage.setItem(LOCAL_ADS_KEY, JSON.stringify(list));
};

// 1. Fetch available Ads (Real-time subscribe or fall back)
export const subscribeToAds = (onUpdate: (ads: Ad[]) => void, onError?: (err: any) => void) => {
  if (!isFirebaseConfigured()) {
    onUpdate(getLocalAds());
    return () => {};
  }

  const path = 'ads';
  try {
    const q = query(collection(db, path), orderBy('id', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const liveAds: Ad[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        liveAds.push({
          id: docSnap.id,
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl,
          link: data.link,
          buttonText: data.buttonText,
          updatedAt: data.updatedAt,
          expiresAt: data.expiresAt,
          imageMode: data.imageMode || 'cover'
        });
      });
      onUpdate(liveAds.length > 0 ? liveAds : getLocalAds());
    }, (error) => {
      console.warn("Firebase snapshot error: ", error);
      onUpdate(getLocalAds());
      if (onError) onError(error);
    });
  } catch (error) {
    console.warn("Firebase query setup error: ", error);
    onUpdate(getLocalAds());
    return () => {};
  }
};

// 2. Publish New/Modified Ad (For Admins)
export const saveAd = async (ad: Ad): Promise<void> => {
  saveLocalAd(ad); // Always persist locally too

  if (!isFirebaseConfigured()) {
    return;
  }

  const path = 'ads';
  try {
    await setDoc(doc(db, path, ad.id), {
      id: ad.id,
      title: ad.title,
      description: ad.description,
      imageUrl: ad.imageUrl || '',
      link: ad.link,
      buttonText: ad.buttonText || 'مشاهده وب‌سایت',
      updatedAt: serverTimestamp(),
      expiresAt: ad.expiresAt || '',
      imageMode: ad.imageMode || 'cover'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${ad.id}`);
  }
};

// 2.5 Delete an advertisement (For Admins)
export const deleteAd = async (id: string): Promise<void> => {
  // Update local storage representation
  const stored = localStorage.getItem(LOCAL_ADS_KEY);
  if (stored) {
    const list: Ad[] = JSON.parse(stored);
    const updated = list.filter(item => item.id !== id);
    localStorage.setItem(LOCAL_ADS_KEY, JSON.stringify(updated));
  }

  if (!isFirebaseConfigured()) {
    return;
  }

  const path = 'ads';
  try {
    await deleteDoc(doc(db, path, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
  }
};

// 3. Submit client Ad Request (Public form)
export const submitAdRequest = async (name: string, contact: string, description: string): Promise<string> => {
  const generatedId = 'req_' + Math.floor(Math.random() * 10000000);
  const newReq: AdRequest = {
    id: generatedId,
    name,
    contact,
    description
  };

  saveLocalAdRequest(newReq); // Persist offline

  if (!isFirebaseConfigured()) {
    return generatedId;
  }

  const path = 'adRequests';
  try {
    await setDoc(doc(db, path, generatedId), {
      id: generatedId,
      name,
      contact,
      description,
      timestamp: serverTimestamp()
    });
    return generatedId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${generatedId}`);
    return generatedId;
  }
};

// 4. Fetch Client Ad Requests (For Admin usage)
export const getAdRequests = async (): Promise<AdRequest[]> => {
  if (!isFirebaseConfigured()) {
    return getLocalAdRequests();
  }

  const path = 'adRequests';
  try {
    const snapshot = await getDocs(collection(db, path));
    const list: AdRequest[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        name: data.name,
        contact: data.contact,
        description: data.description,
        timestamp: data.timestamp
      });
    });
    return list;
  } catch (error) {
    console.warn("Failed to get live ad requests, pulling local list as fallback", error);
    return getLocalAdRequests();
  }
};

// --- Social Contact configurations (Telegram, WhatsApp, Bale) ---
export interface SocialConfig {
  telegram?: string;
  whatsapp?: string;
  bale?: string;
}

const LOCAL_SOCIAL_KEY = 'calendar_social_config';
const DEFAULT_SOCIAL: SocialConfig = {
  telegram: 'alijalali8',
  whatsapp: '989123456789',
  bale: 'alijalali8'
};

export const getSocialConfig = async (): Promise<SocialConfig> => {
  const local = localStorage.getItem(LOCAL_SOCIAL_KEY);
  const fallback = local ? JSON.parse(local) : DEFAULT_SOCIAL;

  if (!isFirebaseConfigured()) {
    return fallback;
  }

  try {
    const configDoc = await getDoc(doc(db, 'settings', 'social_contacts'));
    if (configDoc.exists()) {
      return configDoc.data() as SocialConfig;
    }
    return fallback;
  } catch (error) {
    return fallback;
  }
};

export const saveSocialConfig = async (config: SocialConfig): Promise<void> => {
  localStorage.setItem(LOCAL_SOCIAL_KEY, JSON.stringify(config));

  if (!isFirebaseConfigured()) {
    return;
  }

  try {
    await setDoc(doc(db, 'settings', 'social_contacts'), config as any);
  } catch (error) {
    console.error("Failed to save social config: ", error);
  }
};
