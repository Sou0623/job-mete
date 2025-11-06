# Job Mete - Claude Code 設定ファイル

このドキュメントは、Claude Codeがコード生成・レビュー時に参照するプロジェクト固有のルールと設定をまとめたものです。

---

## 📋 プロジェクト概要

**プロジェクト名:** Job Mete（ジョブメイト）  
**目的:** 就職活動における企業分析・予定管理を一元化した学生向け支援Webアプリ  
**技術スタック:** React (TypeScript) + Firebase + Tailwind CSS

---

## 🎯 基本方針

### 回答言語
- **常に日本語で回答すること**
- コメント、エラーメッセージ、ドキュメントも日本語
- ただし、変数名・関数名・型名は英語（camelCase/PascalCase）

### 設計ドキュメント参照
プロジェクトの設計ドキュメントは `docs/` 配下に配置されています。コード生成前に必ず参照してください：

```
docs/
├── requirements.md              # 要件定義書
├── architecture.md              # アーキテクチャ設計
├── database.md                  # データベース設計
├── api.md                       # API設計
├── sitemap.md                   # サイトマップ設計
└── implementation-guide.md      # 実装ガイド（コーディング規約）
```

---

## 📐 コーディング規約

### TypeScript

#### 型安全性
```typescript
// ✅ 必須：明示的な型定義
interface Company {
  id: string;
  companyName: string;
  normalizedName: string;
}

// ❌ 禁止：any の使用
const data: any = fetchData(); // 避ける

// ✅ 推奨：unknown を使用して型ガード
const data: unknown = fetchData();
if (isCompanyData(data)) {
  // 型安全に使用
}
```

#### Enum禁止
```typescript
// ❌ 禁止：Enum
enum Status { Scheduled, Completed }

// ✅ 推奨：Union Type
type Status = 'scheduled' | 'completed' | 'cancelled';
```

---

### React

#### コンポーネント定義
```typescript
// ✅ 推奨：関数宣言（Arrow関数ではなく）
export default function CompanyCard({ company }: Props) {
  return <div>{company.companyName}</div>;
}

// ❌ 禁止：Arrow関数コンポーネント
export default ({ company }: Props) => <div>...</div>;
```

#### Props型定義
```typescript
// ✅ 必須：interface で Props を定義
interface CompanyCardProps {
  company: Company;
  onDetail: (id: string) => void;
  onAddEvent?: (id: string) => void;
}
```

#### Hooks順序
```typescript
// ✅ 推奨：Hooksは常にこの順序で
function MyComponent() {
  // 1. useState
  const [data, setData] = useState<Company[]>([]);
  
  // 2. useContext
  const { user } = useAuth();
  
  // 3. useRef
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 4. useEffect
  useEffect(() => { }, []);
  
  // 5. カスタムHooks
  const companies = useCompanies();
}
```

---

### スタイリング（重要）

#### Tailwind CSS Only
```typescript
// ✅ 必須：Tailwind のユーティリティクラスのみ使用
<button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
  登録
</button>

// ❌ 絶対禁止：カスタムCSSを書かない
const styles = {
  button: { backgroundColor: '#3b82f6' }
};
<button style={styles.button}>登録</button>

// ❌ 絶対禁止：CSSファイルを作成しない
// Button.css
.custom-button { background: blue; }
```

#### 条件付きスタイル
```typescript
// ✅ 推奨：clsx を使用
import clsx from 'clsx';

<button className={clsx(
  'px-4 py-2 rounded-md',
  {
    'bg-blue-600 text-white': variant === 'primary',
    'bg-gray-200 text-gray-900': variant === 'secondary',
  }
)}>
  ボタン
</button>
```

#### レスポンシブデザイン
```typescript
// ✅ 推奨：Tailwindのブレークポイント
<div className="
  grid 
  grid-cols-1       /* モバイル: 1列 */
  md:grid-cols-2    /* タブレット: 2列 */
  lg:grid-cols-3    /* デスクトップ: 3列 */
  gap-4
">
```

---

### 命名規則

#### ファイル・ディレクトリ
- Reactコンポーネント: `PascalCase.tsx` (例: `CompanyCard.tsx`)
- Hooks: `camelCase.ts` (例: `useCompanies.ts`)
- Utils: `camelCase.ts` (例: `normalizeCompanyName.ts`)
- Types: `camelCase.ts` (例: `company.ts`)

#### 変数・関数
```typescript
// ✅ 推奨：意味のある名前
const companyName = '株式会社〇〇';
const isLoading = false;
const hasError = true;

// ✅ 推奨：動詞で始める関数名
function fetchCompanies() { }
function handleClick() { }
function isValidEmail(email: string): boolean { }

// ✅ 推奨：定数は UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';
```

---

## 🔥 Firebase ルール

### Firestore操作
```typescript
// ✅ 推奨：型安全なFirestore操作
import { collection, query, where, getDocs } from 'firebase/firestore';

async function fetchCompanies(userId: string): Promise<Company[]> {
  const companiesRef = collection(db, 'users', userId, 'companies');
  const q = query(companiesRef, where('analysisMetadata.status', '==', 'completed'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Company));
}
```

### Functions呼び出し
```typescript
// ✅ 推奨：型付きFunctions呼び出し
const fn = httpsCallable<CreateCompanyRequest, CreateCompanyResponse>(
  functions,
  'createCompany'
);
const result = await fn({ companyName: '株式会社コドモン' });
```

---

## 🛡️ セキュリティ

### 環境変数
```typescript
// ✅ 必須：環境変数を使用
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

// ❌ 禁止：ハードコード
const apiKey = 'AIzaSyC1234567890';
```

### XSS対策
```typescript
// ✅ 推奨：Reactが自動エスケープ
<div>{userInput}</div>

// ❌ 禁止：dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

---

## ⚠️ エラーハンドリング

### try-catch の使用
```typescript
// ✅ 推奨：適切なエラーハンドリング
async function handleCreateCompany(companyName: string) {
  try {
    setLoading(true);
    setError(null);
    
    const result = await createCompany({ companyName });
    
    if (result.success) {
      showSuccessToast('企業を登録しました');
    }
  } catch (error) {
    console.error('企業登録エラー:', error);
    
    if (error instanceof FirebaseError) {
      setError(getFirebaseErrorMessage(error.code));
    } else {
      setError('予期しないエラーが発生しました');
    }
  } finally {
    setLoading(false);
  }
}
```

---

## 📝 コメント規約

### JSDoc形式
```typescript
/**
 * 企業名を正規化して重複チェック用の文字列を生成
 * 
 * @param name - 企業名（例: "株式会社コドモン"）
 * @returns 正規化された企業名（例: "こどもん"）
 * 
 * @example
 * normalizeCompanyName("株式会社コドモン") // => "こどもん"
 */
export function normalizeCompanyName(name: string): string {
  // 実装...
}
```

### インラインコメント
```typescript
// ✅ 推奨：「なぜ」を説明
// Gemini APIは429エラーを返すことがあるため、リトライが必要
await retryWithBackoff(() => geminiApi.analyze(companyName));

// ❌ 禁止：「何を」しているかのコメント（コード自体で明らか）
// iを1増やす
i++;
```

---

## 🧪 テスト（将来実装）

### テスト命名
```typescript
// ✅ 推奨：日本語で記述
describe('normalizeCompanyName', () => {
  it('株式会社を除去する', () => {
    expect(normalizeCompanyName('株式会社コドモン')).toBe('こどもん');
  });
});
```

---

## 🚀 パフォーマンス

### React最適化
```typescript
// ✅ 推奨：メモ化が必要な箇所
import { memo, useMemo, useCallback } from 'react';

// 頻繁に再レンダリングされるコンポーネント
const CompanyCard = memo(function CompanyCard({ company }: Props) {
  return <div>{company.companyName}</div>;
});

// 計算コストが高い処理
const sortedCompanies = useMemo(() => {
  return [...companies].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}, [companies]);

// 子コンポーネントに渡す関数
const handleDetail = useCallback((id: string) => {
  navigate(`/companies/${id}`);
}, [navigate]);
```

### Firestore最適化
```typescript
// ✅ 推奨：limit()を使用
const q = query(
  collection(db, 'users', userId, 'companies'),
  orderBy('createdAt', 'desc'),
  limit(20)  // 最初の20件のみ取得
);
```

---

## 📦 コミットメッセージ

### Conventional Commits形式

```bash
# 形式
<type>: <subject>

# type 一覧
feat:     新機能
fix:      バグ修正
docs:     ドキュメント
style:    コードスタイル（機能に影響なし）
refactor: リファクタリング
test:     テスト追加・修正
chore:    ビルド、設定変更

# 例
feat: 企業一覧画面を実装
fix: カレンダー同期のバグを修正
docs: READMEにセットアップ手順を追加
refactor: 企業名正規化ロジックをリファクタリング
test: useCompaniesのテストを追加
chore: Tailwind CSSの設定を更新
```

### ❌ 悪い例
```bash
# 避けるべきコミットメッセージ
修正
update
変更しました
WIP
```

---

## 🎨 コード生成時の観点

### 1. 冗長なコードの回避

```typescript
// ❌ 悪い例：繰り返し
if (status === 'scheduled') {
  return '予定';
} else if (status === 'completed') {
  return '完了';
} else if (status === 'cancelled') {
  return 'キャンセル';
}

// ✅ 良い例：オブジェクトマッピング
const statusLabels: Record<Status, string> = {
  scheduled: '予定',
  completed: '完了',
  cancelled: 'キャンセル',
};
return statusLabels[status];
```

### 2. DRY原則の徹底

```typescript
// ❌ 悪い例：同じロジックの繰り返し
function CompanyCard1() {
  const daysSince = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  // ...
}

function CompanyCard2() {
  const daysSince = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  // ...
}

// ✅ 良い例：共通関数化
function calculateDaysSince(date: string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}
```

### 3. Early Return の活用

```typescript
// ❌ 悪い例：ネストが深い
function CompanyDetail({ companyId }: Props) {
  const company = useCompany(companyId);
  
  return (
    <div>
      {company ? (
        <div>
          {company.analysis ? (
            <div>
              {/* 深いネスト */}
            </div>
          ) : (
            <div>分析なし</div>
          )}
        </div>
      ) : (
        <div>読み込み中</div>
      )}
    </div>
  );
}

// ✅ 良い例：Early Return
function CompanyDetail({ companyId }: Props) {
  const company = useCompany(companyId);
  
  if (!company) {
    return <div>読み込み中...</div>;
  }
  
  if (!company.analysis) {
    return <div>分析データがありません</div>;
  }
  
  return (
    <div>
      {/* フラットな構造 */}
    </div>
  );
}
```

### 4. 単一責任の原則

```typescript
// ❌ 悪い例：1つのコンポーネントで複数の責務
function CompanyPage() {
  // データ取得
  const [companies, setCompanies] = useState([]);
  useEffect(() => { /* fetch */ }, []);
  
  // フィルタリング
  const [filter, setFilter] = useState('');
  const filtered = companies.filter(/* ... */);
  
  // ソート
  const [sortBy, setSortBy] = useState('date');
  const sorted = filtered.sort(/* ... */);
  
  // 表示
  return (
    <div>
      {/* 複雑なUI */}
    </div>
  );
}

// ✅ 良い例：責務を分離
function CompanyPage() {
  return (
    <div>
      <CompanyFilters />
      <CompanySortOptions />
      <CompanyList />
    </div>
  );
}
```

---

## 🔍 コードレビュー時の確認項目

### 自動チェック項目
- [ ] TypeScript型エラーがないか
- [ ] ESLintエラーがないか
- [ ] Prettierフォーマット済みか
- [ ] カスタムCSSを使用していないか
- [ ] `any`型を使用していないか
- [ ] `enum`を使用していないか

### 機能性チェック
- [ ] 要件通りに動作するか
- [ ] エッジケースを考慮しているか
- [ ] エラーハンドリングが適切か
- [ ] ローディング状態を表示しているか

### コード品質チェック
- [ ] 命名規則に従っているか
- [ ] DRY原則に従っているか
- [ ] 適切にコンポーネント分割されているか
- [ ] コメントは「なぜ」を説明しているか

### パフォーマンスチェック
- [ ] 不要な再レンダリングがないか
- [ ] メモ化が必要な箇所で使われているか
- [ ] Firestoreクエリが最適化されているか（limit使用など）

### セキュリティチェック
- [ ] ユーザー入力を適切にバリデーションしているか
- [ ] 環境変数を使用しているか
- [ ] 認証チェックが適切か

---

## 📁 ディレクトリ構造

```
src/
├── components/          # Reactコンポーネント
│   ├── common/         # 汎用コンポーネント（Button, Input等）
│   ├── layout/         # レイアウトコンポーネント
│   ├── companies/      # 企業関連コンポーネント
│   ├── events/         # 予定関連コンポーネント
│   └── trends/         # 傾向分析コンポーネント
│
├── pages/              # ページコンポーネント
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── CompaniesPage.tsx
│   └── ...
│
├── hooks/              # カスタムHooks
│   ├── useAuth.ts
│   ├── useCompanies.ts
│   └── ...
│
├── contexts/           # Reactコンテキスト
│   ├── AuthContext.tsx
│   └── ...
│
├── services/           # 外部サービス連携
│   ├── firebase.ts
│   ├── firestore.ts
│   └── functions.ts
│
├── utils/              # ユーティリティ関数
│   ├── normalizeCompanyName.ts
│   ├── dateFormatter.ts
│   └── ...
│
├── types/              # TypeScript型定義
│   ├── company.ts
│   ├── event.ts
│   └── ...
│
└── constants/          # 定数
    ├── eventTypes.ts
    └── ...
```

**ルール:**
- 各ディレクトリに`index.ts`を配置してエクスポート
- コンポーネント名 = ファイル名（PascalCase）
- 1ファイル1コンポーネント（例外: 小さなヘルパーコンポーネント）

---

## 🔧 開発環境

### 必須ツール
- Node.js: v18以上
- Firebase CLI: 最新版
- VSCode: 推奨エディタ

### VSCode拡張機能
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Firebase Explorer
- TypeScript

### エミュレータ起動
```bash
# Firebase Emulators起動
firebase emulators:start

# Functions自動ビルド（別ターミナル）
cd functions && npm run build -- --watch

# React開発サーバー（別ターミナル）
npm start
```

---

## 🚨 絶対に避けるべきこと

### ❌ 絶対禁止リスト

1. **カスタムCSSの記述**
   ```css
   /* ❌ 絶対禁止 */
   .custom-button {
     background: blue;
   }
   ```

2. **any型の使用**
   ```typescript
   // ❌ 絶対禁止
   const data: any = fetchData();
   ```

3. **Enumの使用**
   ```typescript
   // ❌ 絶対禁止
   enum Status { Scheduled, Completed }
   ```

4. **ハードコードされたAPIキー**
   ```typescript
   // ❌ 絶対禁止
   const apiKey = 'AIzaSyC1234567890';
   ```

5. **dangerouslySetInnerHTMLの使用**
   ```typescript
   // ❌ 絶対禁止
   <div dangerouslySetInnerHTML={{ __html: userInput }} />
   ```

6. **console.logの本番環境残留**
   ```typescript
   // ❌ デバッグ後は削除
   console.log('debug:', data);
   ```

---

## 💡 推奨パターン

### ✅ 積極的に使用すべきもの

1. **Tailwind CSSのユーティリティクラス**
   ```typescript
   <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
   ```

2. **Union Type**
   ```typescript
   type Status = 'scheduled' | 'completed' | 'cancelled';
   ```

3. **型ガード**
   ```typescript
   function isCompanyData(data: unknown): data is Company {
     return typeof data === 'object' && data !== null && 'id' in data;
   }
   ```

4. **Early Return**
   ```typescript
   if (!user) return <LoginPage />;
   ```

5. **カスタムHooks**
   ```typescript
   const { companies, loading } = useCompanies();
   ```

6. **JSDocコメント**
   ```typescript
   /**
    * 企業名を正規化
    * @param name - 企業名
    * @returns 正規化された企業名
    */
   ```

---

## 🎓 参考資料

### プロジェクト内ドキュメント
- `docs/requirements.md` - 要件定義書
- `docs/architecture.md` - アーキテクチャ設計
- `docs/database.md` - データベース設計
- `docs/api.md` - API設計
- `docs/sitemap.md` - サイトマップ設計
- `docs/implementation-guide.md` - 実装ガイド（本ドキュメント）

### 外部リンク
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

---

## 📌 特記事項

### プロジェクト固有のルール

1. **企業名の正規化**
   - 全ての企業名は`normalizeCompanyName()`で正規化すること
   - 重複チェックには正規化された名前を使用

2. **日付フォーマット**
   - ISO 8601形式を使用: `2025-10-15T13:00:00+09:00`
   - 表示時は`date-fns`でフォーマット

3. **Firestore パス**
   - ユーザーデータ: `users/{userId}/companies/{companyId}`
   - 必ずユーザーIDをベースにしたパス構造

4. **Functions呼び出し**
   - 全てのAPI呼び出しは型安全に（`httpsCallable<Request, Response>`）
   - エラーハンドリングを必ず実装

5. **環境変数プレフィックス**
   - Vite環境変数は`VITE_`で始める
   - 例: `VITE_FIREBASE_API_KEY`

---

## 🔄 このドキュメントの更新

このドキュメントは、プロジェクトの進化に合わせて随時更新されます。

**最終更新:** 2025/10/13  
**バージョン:** v1.5  
**更新履歴:**
- v1.5 (2025/10/13): 初版作成

---

## ✅ チェックリスト（コード生成前）

コードを生成する前に、以下を確認してください：

- [ ] `docs/`配下の設計ドキュメントを参照した
- [ ] TypeScriptの型定義を明示的に行う
- [ ] Tailwind CSSのみを使用（カスタムCSS禁止）
- [ ] `any`型を使用しない
- [ ] `enum`を使用しない
- [ ] 環境変数を使用（ハードコード禁止）
- [ ] エラーハンドリングを実装
- [ ] JSDocコメントを記述
- [ ] DRY原則に従う
- [ ] Early Returnを活用
- [ ] 単一責任の原則に従う
- [ ] コミットメッセージはConventional Commits形式

---

## 🎯 Claude Code へのお願い

このドキュメントに記載されたルールと規約を厳密に守ってください。特に以下の点は重要です：

1. **統一感**: 既存コードと同じパターンを使用
2. **Tailwind Only**: カスタムCSSは絶対に書かない
3. **型安全性**: TypeScriptの型を最大限活用
4. **日本語**: コメント・ドキュメントは日本語で
5. **設計書参照**: `docs/`配下の設計書を必ず確認

これらのルールに従うことで、保守性の高い、統一感のあるコードベースを維持できます。

---

**このドキュメントに従って、素晴らしいコードを生成してください！ 🚀**