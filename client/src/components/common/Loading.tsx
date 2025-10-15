/**
 * 共通ローディングコンポーネント
 * アプリ全体で統一されたローディング表示
 */

interface LoadingProps {
  /**
   * ローディングサイズ
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * メッセージを表示するか
   * @default true
   */
  showMessage?: boolean;
  /**
   * カスタムメッセージ
   */
  message?: string;
  /**
   * フルスクリーン表示するか
   * @default false
   */
  fullScreen?: boolean;
}

export default function Loading({
  size = 'md',
  showMessage = true,
  message = 'データを読み込んでいます...',
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-b-2',
    lg: 'h-16 w-16 border-b-3',
  };

  const content = (
    <div className="text-center">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-blue-600 mx-auto`}
      ></div>
      {showMessage && (
        <p className="mt-4 text-gray-600 animate-pulse">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        {content}
      </div>
    );
  }

  return content;
}
