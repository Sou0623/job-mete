/**
 * ユーザーデータの型定義
 */

/**
 * ユーザー情報
 */
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string; // ISO 8601
  lastLoginAt: string; // ISO 8601
}
