/**
 * デバッグ用: displayNameをクリアする関数
 * ブラウザのコンソールで実行して初回ログイン状態を再現
 */

import { auth } from '@/services/firebase';
import { updateProfile } from 'firebase/auth';

export async function clearDisplayName() {
  const user = auth.currentUser;
  if (!user) {
    console.error('ログインしていません');
    return;
  }

  try {
    await updateProfile(user, {
      displayName: '',
    });
    console.log('displayNameをクリアしました。ページをリロードしてください。');
    window.location.reload();
  } catch (error) {
    console.error('エラー:', error);
  }
}

// グローバルに公開
(window as any).clearDisplayName = clearDisplayName;
