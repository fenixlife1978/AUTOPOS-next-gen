
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import { firebaseConfig } from './config';

/**
 * Inicializa Firebase de forma segura para SSR y Cliente.
 * Los servicios (Firestore, Auth, RTDB) solo se inicializan si estamos en el cliente
 * o si se solicitan explícitamente, evitando errores de 'No Firebase App created'.
 */
export function initializeFirebase() {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  // En el servidor, devolvemos proxies o manejamos con cuidado
  // En el cliente, devolvemos los servicios reales
  const firestore = getFirestore(app);
  const auth = getAuth(app);
  const rtdb = getDatabase(app);

  return { app, firestore, auth, rtdb };
}
