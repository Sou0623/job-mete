/**
 * 重いテーブルコンポーネントのダミー実装
 *
 * 実際のプロジェクトでは、大量のデータを扱うテーブルライブラリを使用します。
 * このコンポーネントは遅延ロードの動作確認用のダミー実装です。
 */

export default function HeavyTableComponent() {
  // ダミーデータ（大量のデータを想定）
  const data = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    company: `企業${i + 1}`,
    status: i % 3 === 0 ? '完了' : i % 3 === 1 ? '進行中' : '予定',
    date: `2025-10-${String((i % 30) + 1).padStart(2, '0')}`,
  }));

  return (
    <div className="p-4">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          このテーブルコンポーネントは遅延ロードされています。
          ボタンをクリックするまでバンドルに含まれていません。
        </p>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left text-sm font-medium">
                ID
              </th>
              <th className="border px-4 py-2 text-left text-sm font-medium">
                企業名
              </th>
              <th className="border px-4 py-2 text-left text-sm font-medium">
                ステータス
              </th>
              <th className="border px-4 py-2 text-left text-sm font-medium">
                日付
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2 text-sm">{row.id}</td>
                <td className="border px-4 py-2 text-sm">{row.company}</td>
                <td className="border px-4 py-2 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.status === '完了'
                        ? 'bg-green-100 text-green-800'
                        : row.status === '進行中'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="border px-4 py-2 text-sm">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
        <p className="text-sm text-green-800">
          ✅ テーブルコンポーネントが正常に遅延ロードされました（{data.length}
          行）
        </p>
      </div>
    </div>
  );
}
