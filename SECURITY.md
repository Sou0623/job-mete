# セキュリティガイド

Job Mete アプリケーションのセキュリティに関する情報をまとめたドキュメントです。

---

## 📋 目次

1. [セキュリティ対策の概要](#セキュリティ対策の概要)
2. [実装されているセキュリティ機能](#実装されているセキュリティ機能)
3. [開発時の注意事項](#開発時の注意事項)
4. [脆弱性の報告](#脆弱性の報告)

---

## セキュリティ対策の概要

### 主要な脅威とその対策

| 脅威 | 対策 | 実装場所 |
|------|------|----------|
| XSS (クロスサイトスクリプティング) | 入力サニタイゼーション、React自動エスケープ | `src/utils/validation.ts` |
| プロンプトインジェクション | パターン検出、入力フィルタリング | `src/utils/validation.ts` |
| 認証情報の漏洩 | 環境変数管理、.gitignore設定 | `.env.local`, `.gitignore` |
| 不正なデータ入力 | バリデーション、文字数制限 | `src/utils/validation.ts` |
| CSRF (クロスサイトリクエストフォージェリ) | Firebase Authentication | Firebase SDK |
| SQLインジェクション | Firestore SDK（パラメータ化クエリ） | Firebase SDK |

---

## 実装されているセキュリティ機能

### 1. 入力バリデーション

全てのユーザー入力に対して、以下のバリデーションを実施しています。

#### 文字数制限

```typescript
// src/utils/validation.ts
export const INPUT_LIMITS = {
  COMPANY_NAME: 100,      // 企業名: 100文字まで
  EVENT_TITLE: 100,       // イベントタイトル: 100文字まで
  MEMO: 1000,             // メモ: 1000文字まで
  LOCATION: 200,          // 場所: 200文字まで
  SEARCH_QUERY: 100,      // 検索クエリ: 100文字まで
  EMAIL: 254,             // メールアドレス: RFC 5321準拠
  PASSWORD_MIN: 8,        // パスワード最小: 8文字
  PASSWORD_MAX: 128,      // パスワード最大: 128文字
};
```

#### 危険なパターンの検出

以下のパターンを含む入力を拒否します：

- `<script>` タグ
- `<iframe>` タグ
- `javascript:` プロトコル
- イベントハンドラ (`onclick=`, `onerror=` など)
- `eval()` 関数
- HTMLコメント

#### プロンプトインジェクション対策

AIへの指示を含む可能性のある以下のパターンを検出・拒否します：

- `ignore previous instructions`
- `disregard all prompts`
- `system:`, `assistant:`, `user:` などのロールプレフィックス
- `[INST]`, `[/INST]` などの特殊トークン

### 2. 入力サニタイゼーション

```typescript
// 使用例
import { sanitizeInput, validateCompanyName } from '@/utils/validation';

// 企業名のバリデーション
const result = validateCompanyName(userInput);
if (!result.valid) {
  setError(result.error);
  return;
}

// サニタイズされた値を使用
const sanitizedName = result.sanitized;
```

サニタイゼーション処理：
- HTMLタグの除去
- 制御文字の除去
- 連続する空白の正規化
- 前後の空白のトリミング

### 3. パスワードセキュリティ

```typescript
// パスワード要件
- 最小8文字、最大128文字
- 英字と数字を両方含む必要がある
- Firebase Authenticationによる安全な保存
```

### 4. 環境変数の管理

機密情報は環境変数で管理し、Gitにコミットしません。

```bash
# ✅ 正しい: .env.local に記載（Gitに含まれない）
VITE_FIREBASE_API_KEY=actual-api-key-here

# ❌ 間違い: ソースコードに直接記載
const apiKey = "actual-api-key-here"; // 絶対にNG
```

`.gitignore` で以下を除外：
- `.env.local`
- `CLAUDE.md`（プロンプト設定）
- `docs/`（内部設計情報）
- `.firebaserc`（実際のプロジェクトID）

### 5. Firebase セキュリティルール

Firestore および Storage のセキュリティルールを適切に設定しています。

```javascript
// Firestore Security Rules (例)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 開発時の注意事項

### ✅ やるべきこと

1. **全ての入力をバリデーション**
   ```typescript
   import { validateCompanyName } from '@/utils/validation';

   const result = validateCompanyName(input);
   if (!result.valid) {
     // エラー処理
     return;
   }
   ```

2. **環境変数を使用**
   ```typescript
   // ✅ 正しい
   const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

   // ❌ 間違い
   const apiKey = "AIzaSyC..."; // ハードコード禁止
   ```

3. **ユーザー入力をサニタイズ**
   ```typescript
   const sanitized = sanitizeInput(userInput);
   ```

4. **型安全性を保つ**
   ```typescript
   // ✅ 正しい
   interface FormData {
     companyName: string;
     eventDate: string;
   }

   // ❌ 間違い
   const data: any = { ... }; // any型禁止
   ```

### ❌ やってはいけないこと

1. **APIキーをハードコード**
   ```typescript
   // ❌ 絶対禁止
   const apiKey = "AIzaSyC1234567890abcdef";
   ```

2. **any型の使用**
   ```typescript
   // ❌ 避ける
   const data: any = fetchData();
   ```

3. **dangerouslySetInnerHTMLの使用**
   ```typescript
   // ❌ XSS脆弱性
   <div dangerouslySetInnerHTML={{ __html: userInput }} />
   ```

4. **バリデーションのスキップ**
   ```typescript
   // ❌ 危険
   await createCompany(userInput); // バリデーションなし
   ```

5. **機密情報のログ出力**
   ```typescript
   // ❌ 本番環境で禁止
   console.log('API Key:', apiKey);
   console.log('User password:', password);
   ```

---

## テスト

セキュリティ機能のテストは以下で実施されています：

```bash
# バリデーション関数のテスト
npm test -- validation.test.ts

# 全体のテスト実行
npm test
```

テストカバレッジ：
- 入力バリデーション: 100%
- サニタイゼーション: 100%
- 危険パターン検出: 100%

---

## 脆弱性の報告

セキュリティ上の問題を発見された場合は、以下の手順で報告してください。

### 報告方法

1. **公開Issueを作成しない**
   - 脆弱性情報は公開せず、直接連絡してください

2. **連絡先**
   - メール: [your-email@example.com]
   - GitHub: プライベートメッセージ

3. **報告内容**
   - 脆弱性の詳細な説明
   - 再現手順
   - 影響範囲
   - 可能であれば修正案

### 対応プロセス

1. **受領確認**: 24時間以内に受領確認
2. **調査**: 脆弱性の検証と影響範囲の調査
3. **修正**: パッチの作成とテスト
4. **リリース**: セキュリティアップデートのリリース
5. **開示**: 修正後に適切な方法で開示

---

## セキュリティチェックリスト

新機能を実装する際は、以下を確認してください。

### フロントエンド

- [ ] 全てのユーザー入力にバリデーションを実装
- [ ] サニタイゼーション関数を使用
- [ ] 環境変数でAPIキーを管理
- [ ] `any`型を使用していない
- [ ] `dangerouslySetInnerHTML`を使用していない
- [ ] パスワードなどの機密情報をログに出力していない

### バックエンド (Firebase Functions)

- [ ] Firebase Authentication で認証チェック
- [ ] ユーザーIDでデータアクセスを制限
- [ ] 入力バリデーションを実装
- [ ] レート制限を設定
- [ ] エラーメッセージに機密情報を含めない

### インフラ

- [ ] Firestore Security Rules を適切に設定
- [ ] Storage Security Rules を適切に設定
- [ ] 環境変数が `.env.local` に保存されている
- [ ] `.gitignore` で機密ファイルを除外
- [ ] HTTPS通信を使用

---

## 参考資料

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)
- [React Security Best Practices](https://react.dev/learn/writing-markup-with-jsx#why-do-multiple-jsx-tags-need-to-be-wrapped)
- [TypeScript Security](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)

---

**最終更新:** 2025/10/24
**バージョン:** v1.0
