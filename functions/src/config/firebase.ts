/**
 * Firebase Admin SDK の初期化
 */

import * as admin from "firebase-admin";

// Firebase Admin の初期化（Emulator環境でも動作）
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Firestore インスタンス
 */
export const db = admin.firestore();

/**
 * Firebase Auth インスタンス
 */
export const auth = admin.auth();
