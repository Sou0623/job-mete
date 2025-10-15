/**
 * 共通エラーメッセージコンポーネント
 * アプリ全体で統一されたエラー表示
 */

interface ErrorMessageProps {
  /**
   * エラーメッセージ
   */
  message: string;
  /**
   * エラーの種類
   * @default 'error'
   */
  type?: 'error' | 'warning' | 'info';
  /**
   * 閉じるボタンを表示するか
   * @default false
   */
  dismissible?: boolean;
  /**
   * 閉じるボタンのコールバック
   */
  onDismiss?: () => void;
  /**
   * フルスクリーン表示するか
   * @default false
   */
  fullScreen?: boolean;
  /**
   * アクションボタン（リトライなど）
   */
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function ErrorMessage({
  message,
  type = 'error',
  dismissible = false,
  onDismiss,
  fullScreen = false,
  action,
}: ErrorMessageProps) {
  const typeStyles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '❌',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '⚠️',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'ℹ️',
    },
  };

  const style = typeStyles[type];

  const content = (
    <div
      className={`${style.bg} ${style.border} border rounded-lg p-4 animate-fade-in`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{style.icon}</span>
        <div className="flex-1">
          <p className={`${style.text} text-sm leading-relaxed`}>{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 underline"
            >
              {action.label}
            </button>
          )}
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={`${style.text} hover:opacity-70 transition-opacity flex-shrink-0`}
            aria-label="閉じる"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="max-w-md w-full">{content}</div>
      </div>
    );
  }

  return content;
}
