/**
 * Firebase SDK の初期化と Emulator 接続
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

/**
 * Firebase 設定（環境変数から読み込み）
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Firebase App 初期化
 */
const app = initializeApp(firebaseConfig);

/**
 * Firebase サービスの取得
 */
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app, 'asia-northeast1');

/**
 * Emulator 接続（開発環境のみ）
 *
 * - import.meta.env.DEV は Vite が提供する環境変数（開発環境で true）
 * - Emulator 接続は1度だけ実行する必要があるため、このファイル読み込み時に実行
 */
if (import.meta.env.DEV) {
  try {
    // Firestore Emulator に接続
    connectFirestoreEmulator(db, 'localhost', 8080);

    // Authentication Emulator に接続
    connectAuthEmulator(auth, 'http://localhost:9099', {
      disableWarnings: true,
    });

    // Functions Emulator に接続
    connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch (error) {
    // 既に接続済みの場合はエラーが発生するが、無視する
  }
}
