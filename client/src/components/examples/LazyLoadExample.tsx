/**
 * React.lazy を使用したコード分割の例
 *
 * このコンポーネントは、React.lazyとSuspenseを使用して
 * コンポーネントを遅延ロードする実装例です。
 */

import { lazy, Suspense, useState } from 'react';
import Loading from '@/components/common/Loading';

// ✅ React.lazy: 重いコンポーネントを遅延ロード
// ボタンがクリックされるまでバンドルに含まれない
const HeavyChart = lazy(() => import('./HeavyChartComponent'));
const HeavyTable = lazy(() => import('./HeavyTableComponent'));

/**
 * 遅延ロードの使用例コンポーネント
 */
export default function LazyLoadExample() {
  const [showChart, setShowChart] = useState(false);
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        React.lazy によるコード分割の例
      </h1>

      {/* 説明 */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h2 className="font-medium mb-2">コード分割の利点</h2>
        <ul className="text-sm space-y-1">
          <li>
            ✅ <strong>初期バンドルサイズの削減</strong>:
            使用頻度の低いコンポーネントを別ファイルに分割
          </li>
          <li>
            ✅ <strong>初期ロード時間の短縮</strong>:
            必要なコードのみを最初にロード
          </li>
          <li>
            ✅ <strong>メモリ使用量の最適化</strong>:
            必要なときだけコンポーネントをロード
          </li>
        </ul>
      </div>

      {/* コントロールボタン */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setShowChart(!showChart)}
          className={`px-4 py-2 rounded-md font-medium ${
            showChart
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-900'
          }`}
        >
          {showChart ? 'チャートを非表示' : 'チャートを表示'}
        </button>

        <button
          onClick={() => setShowTable(!showTable)}
          className={`px-4 py-2 rounded-md font-medium ${
            showTable
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-900'
          }`}
        >
          {showTable ? 'テーブルを非表示' : 'テーブルを表示'}
        </button>
      </div>

      {/* 遅延ロードされるコンポーネント */}
      <div className="space-y-6">
        {showChart && (
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-3">チャートコンポーネント</h3>
            <Suspense fallback={<Loading message="チャートを読み込んでいます..." />}>
              <HeavyChart />
            </Suspense>
          </div>
        )}

        {showTable && (
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-3">テーブルコンポーネント</h3>
            <Suspense fallback={<Loading message="テーブルを読み込んでいます..." />}>
              <HeavyTable />
            </Suspense>
          </div>
        )}
      </div>

      {/* 開発者向け情報 */}
      <div className="mt-8 p-4 bg-gray-50 border rounded-md">
        <h3 className="font-medium mb-2">開発者向け情報</h3>
        <p className="text-sm text-gray-600 mb-2">
          ブラウザの開発者ツールのNetworkタブを開いて、ボタンをクリックした際に
          新しいJavaScriptファイルが読み込まれることを確認してください。
        </p>
        <div className="text-sm space-y-1">
          <p>
            <strong>実装コード:</strong>
          </p>
          <pre className="bg-gray-800 text-white p-3 rounded-md overflow-x-auto">
            {`const HeavyChart = lazy(() => import('./HeavyChartComponent'));
const HeavyTable = lazy(() => import('./HeavyTableComponent'));

<Suspense fallback={<Loading />}>
  <HeavyChart />
</Suspense>`}
          </pre>
        </div>
      </div>

      {/* ベストプラクティス */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="font-medium mb-2">遅延ロードを適用すべきケース</h3>
        <ul className="text-sm space-y-1">
          <li>
            ✅ <strong>ページコンポーネント</strong>: ルーティングごとに分割
          </li>
          <li>
            ✅ <strong>モーダルコンポーネント</strong>:
            ユーザーがトリガーするまでロード不要
          </li>
          <li>
            ✅ <strong>使用頻度の低い機能</strong>:
            設定画面、管理画面など
          </li>
          <li>
            ✅ <strong>サイズの大きいライブラリを使用するコンポーネント</strong>:
            チャート、エディタなど
          </li>
        </ul>
      </div>

      {/* 避けるべきケース */}
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="font-medium mb-2">遅延ロードを避けるべきケース</h3>
        <ul className="text-sm space-y-1">
          <li>
            ❌ <strong>初期表示に必要なコンポーネント</strong>:
            ローディング時間が長くなる
          </li>
          <li>
            ❌ <strong>サイズの小さいコンポーネント</strong>:
            オーバーヘッドの方が大きい
          </li>
          <li>
            ❌ <strong>頻繁に使用されるコンポーネント</strong>:
            ユーザー体験が悪化する
          </li>
        </ul>
      </div>
    </div>
  );
}
