/**
 * 重いチャートコンポーネントのダミー実装
 *
 * 実際のプロジェクトでは、Chart.jsやRechart等のライブラリを使用します。
 * このコンポーネントは遅延ロードの動作確認用のダミー実装です。
 */

export default function HeavyChartComponent() {
  // ダミーデータ
  const data = [
    { label: '1月', value: 65 },
    { label: '2月', value: 59 },
    { label: '3月', value: 80 },
    { label: '4月', value: 81 },
    { label: '5月', value: 56 },
    { label: '6月', value: 55 },
  ];

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="p-4">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          このコンポーネントは遅延ロードされています。
          ボタンをクリックするまでバンドルに含まれていません。
        </p>
      </div>

      {/* シンプルな棒グラフ */}
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-sm font-medium w-12">{item.label}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium w-12 text-right">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
        <p className="text-sm text-green-800">
          ✅ チャートコンポーネントが正常に遅延ロードされました
        </p>
      </div>
    </div>
  );
}
