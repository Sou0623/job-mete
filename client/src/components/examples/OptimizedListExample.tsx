/**
 * パフォーマンス最適化の使用例
 *
 * このコンポーネントは、useMemo、useCallback、React.memoを
 * 組み合わせて最適化されたリストコンポーネントの実装例です。
 */

import { useState, useMemo, useCallback, memo } from 'react';

// ダミーデータの型定義
interface Item {
  id: string;
  name: string;
  category: string;
  priority: number;
  createdAt: string;
}

// リストアイテムコンポーネント（memo化）
interface ListItemProps {
  item: Item;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ListItem = memo(function ListItem({
  item,
  onEdit,
  onDelete,
}: ListItemProps) {
  return (
    <div className="p-4 border rounded-md flex items-center justify-between">
      <div>
        <h3 className="font-medium">{item.name}</h3>
        <p className="text-sm text-gray-600">
          カテゴリ: {item.category} | 優先度: {item.priority}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(item.id)}
          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          編集
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          削除
        </button>
      </div>
    </div>
  );
});

/**
 * 最適化されたリストコンポーネント
 */
export default function OptimizedListExample() {
  // ダミーデータ
  const [items] = useState<Item[]>([
    {
      id: '1',
      name: '株式会社コドモン',
      category: 'IT',
      priority: 5,
      createdAt: '2025-10-01T10:00:00+09:00',
    },
    {
      id: '2',
      name: '株式会社メルカリ',
      category: 'IT',
      priority: 3,
      createdAt: '2025-10-02T11:00:00+09:00',
    },
    {
      id: '3',
      name: 'サイボウズ株式会社',
      category: 'IT',
      priority: 4,
      createdAt: '2025-10-03T12:00:00+09:00',
    },
  ]);

  const [sortBy, setSortBy] = useState<'name' | 'priority' | 'createdAt'>(
    'createdAt'
  );
  const [filterCategory, setFilterCategory] = useState<string>('');

  // ✅ useMemo: 計算コストの高いフィルタリングとソート処理をメモ化
  const filteredAndSortedItems = useMemo(() => {
    console.log('フィルタリングとソートを実行'); // デバッグ用

    // フィルタリング
    let result = items;
    if (filterCategory) {
      result = result.filter((item) => item.category === filterCategory);
    }

    // ソート
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'priority') {
        return b.priority - a.priority;
      } else {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    });

    return result;
  }, [items, sortBy, filterCategory]);

  // ✅ useMemo: カテゴリの一覧を計算（重複排除）
  const categories = useMemo(() => {
    const categorySet = new Set(items.map((item) => item.category));
    return Array.from(categorySet);
  }, [items]);

  // ✅ useCallback: 子コンポーネント（memo化されたListItem）に渡す関数をメモ化
  const handleEdit = useCallback((id: string) => {
    console.log('編集:', id);
    // 実際の編集処理をここに実装
  }, []);

  const handleDelete = useCallback((id: string) => {
    console.log('削除:', id);
    // 実際の削除処理をここに実装
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        パフォーマンス最適化の使用例
      </h1>

      {/* フィルタとソートのコントロール */}
      <div className="mb-6 flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">ソート</label>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'name' | 'priority' | 'createdAt')
            }
            className="border rounded-md px-3 py-2"
          >
            <option value="createdAt">作成日時</option>
            <option value="name">名前</option>
            <option value="priority">優先度</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            カテゴリフィルタ
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="">すべて</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 最適化の説明 */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h2 className="font-medium mb-2">このコンポーネントの最適化ポイント</h2>
        <ul className="text-sm space-y-1">
          <li>
            ✅ <strong>useMemo</strong>:
            フィルタリングとソート処理は計算コストが高いため、依存配列が変更されたときのみ再計算
          </li>
          <li>
            ✅ <strong>useCallback</strong>:
            handleEditとhandleDeleteをメモ化し、子コンポーネントの不要な再レンダリングを防止
          </li>
          <li>
            ✅ <strong>React.memo</strong>:
            ListItemコンポーネントをメモ化し、propsが変更されていない場合は再レンダリングをスキップ
          </li>
        </ul>
        <p className="text-sm mt-2 text-gray-600">
          ※ ブラウザのコンソールを開いて、フィルタやソートを変更した際に「フィルタリングとソートを実行」が表示されることを確認してください。
        </p>
      </div>

      {/* リスト表示 */}
      <div className="space-y-3">
        {filteredAndSortedItems.length > 0 ? (
          filteredAndSortedItems.map((item) => (
            <ListItem
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <p className="text-center text-gray-600 py-8">
            該当するアイテムがありません
          </p>
        )}
      </div>

      {/* パフォーマンステストボタン */}
      <div className="mt-8 p-4 bg-gray-50 border rounded-md">
        <h3 className="font-medium mb-2">パフォーマンステスト</h3>
        <p className="text-sm text-gray-600 mb-3">
          以下のボタンをクリックして、コンポーネントの再レンダリングをトリガーしてください。
          ListItemコンポーネントがメモ化されているため、propsが変更されていない場合は再レンダリングされません。
        </p>
        <button
          onClick={() => console.log('親コンポーネントを強制的に再レンダリング')}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          親コンポーネントを再レンダリング
        </button>
      </div>
    </div>
  );
}
