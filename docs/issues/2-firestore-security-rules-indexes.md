# Issue #2: Firestore セキュリティルール・インデックスの設定

## 背景 / 目的
ユーザーごとのデータ分離を実現し、セキュリティを確保するため、Firestore のセキュリティルールを実装します。また、クエリパフォーマンスを向上させるため、必要な複合インデックスを定義します。

- **依存**: #1
- **ラベル**: `infra`, `security`
- **作業時間**: 0.5日

---

## スコープ / 作業項目

### 1. firestore.rules の実装
- ユーザー認証チェック（`request.auth != null`）
- ユーザーID の一致チェック（`request.auth.uid == userId`）
- サブコレクション（companies, events, trends, usage）のルール設定
- デフォルト拒否ルール

### 2. firestore.indexes.json の定義
参照: `docs/job_mete_database.txt` のインデックス設計

#### 必要なインデックス
- **companies**:
  - `normalizedName` (ASC) - 重複チェック用
  - `createdAt` (DESC) - 登録日順ソート
  - `stats.eventCount` (DESC) + `createdAt` (DESC) - 予定数順ソート

- **events**:
  - `companyId` (ASC) + `date` (ASC) - 企業別予定取得
  - `status` (ASC) + `date` (ASC) - ステータスフィルタ
  - `date` (ASC) - 日付順ソート

### 3. Emulator でのルールテスト
- 自分のデータにアクセス可能
- 他ユーザーのデータにアクセス不可
- 未認証時はアクセス不可

---

## ゴール / 完了条件（Acceptance Criteria）

- [ ] firestore.rules が実装され、ユーザーごとのデータ分離が実現されている
- [ ] firestore.indexes.json に必要な複合インデックスが定義されている（companies, eventsのクエリ用）
- [ ] Emulator上でルールが正しく動作することを確認（他ユーザーのデータにアクセスできないこと）

---

## テスト観点

### セキュリティルールのテスト
- **正常系**:
  - 認証済みユーザーが自分のデータを読み書きできる
  - `users/{userId}/companies` の read/write が可能
  - `users/{userId}/events` の read/write が可能

- **異常系**:
  - 未認証ユーザーはアクセスできない
  - 他ユーザーのデータにアクセスできない
  - `users/{otherUserId}/companies` の read/write が拒否される

### 検証方法
```bash
# Emulator UI でルールをテスト
# http://localhost:4000/firestore

# または、Firebase CLI でテスト
firebase emulators:exec --only firestore "npm test"
```

---

## 実装参考

### firestore.rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ユーザープロフィール
    match /users/{userId}/profile {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }

    // 企業データ
    match /users/{userId}/companies/{companyId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;

      // 作成時バリデーション
      allow create: if request.auth.uid == userId
                    && request.resource.data.companyName is string
                    && request.resource.data.normalizedName is string
                    && request.resource.data.analysis is map;
    }

    // 予定データ
    match /users/{userId}/events/{eventId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;

      // 作成時バリデーション
      allow create: if request.auth.uid == userId
                    && request.resource.data.companyId is string
                    && request.resource.data.date is timestamp
                    && request.resource.data.eventType is string;
    }

    // 傾向分析
    match /users/{userId}/trends/{trendId} {
      allow read: if request.auth != null
                  && request.auth.uid == userId;
      allow write: if false; // Functions経由のみ
    }

    // 使用量データ
    match /users/{userId}/usage/{usageId} {
      allow read: if request.auth != null
                  && request.auth.uid == userId;
      allow write: if false; // Functions経由のみ
    }

    // デフォルト拒否
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### firestore.indexes.json
```json
{
  "indexes": [
    {
      "collectionGroup": "companies",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "normalizedName", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "companies",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "companies",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "stats.eventCount", "order": "DESCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "companyId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## 参考資料

- `docs/job_mete_database.txt` - セキュリティルール、インデックス設計
- `docs/job_mete_architecture.txt` - セキュリティアーキテクチャ
