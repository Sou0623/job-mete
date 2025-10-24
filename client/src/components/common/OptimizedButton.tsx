/**
 * パフォーマンス最適化されたボタンコンポーネント
 *
 * このコンポーネントは、React.memoを使用して不要な再レンダリングを防止しています。
 * 親コンポーネントが再レンダリングされても、propsが変更されていない場合は
 * 再レンダリングをスキップします。
 */

import { memo } from 'react';

interface OptimizedButtonProps {
  /**
   * ボタンのラベル
   */
  children: React.ReactNode;
  /**
   * クリックイベントハンドラ
   */
  onClick: () => void;
  /**
   * ボタンのバリアント
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'danger';
  /**
   * 無効化フラグ
   * @default false
   */
  disabled?: boolean;
  /**
   * ローディング状態
   * @default false
   */
  loading?: boolean;
  /**
   * ボタンのサイズ
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * フルワイドで表示するか
   * @default false
   */
  fullWidth?: boolean;
}

/**
 * 最適化されたボタンコンポーネント
 *
 * React.memoでラップされているため、propsが変更されていない場合は
 * 再レンダリングをスキップします。
 */
const OptimizedButton = memo(function OptimizedButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  size = 'md',
  fullWidth = false,
}: OptimizedButtonProps) {
  // バリアント別のスタイル
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  // サイズ別のスタイル
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // 無効化状態のスタイル
  const disabledStyles = 'opacity-50 cursor-not-allowed';

  // クラス名を組み立て
  const className = [
    'rounded-md font-medium transition-colors duration-200',
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? 'w-full' : '',
    disabled || loading ? disabledStyles : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          処理中...
        </span>
      ) : (
        children
      )}
    </button>
  );
});

export default OptimizedButton;
