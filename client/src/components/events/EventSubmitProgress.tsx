/**
 * 予定登録進行状況表示コンポーネント
 * 予定登録からカレンダー同期までのプロセスを視覚的に表示
 */

import { useEffect, useState } from 'react';

type SubmitStep = 'validating' | 'registering' | 'syncing' | 'completed';

interface EventSubmitProgressProps {
  /** 現在のステップ */
  currentStep: SubmitStep;
  /** 企業名 */
  companyName: string;
  /** イベント種別 */
  eventType: string;
  /** プログレス（0-100） */
  progress?: number;
  /** カレンダー同期が有効かどうか */
  syncToCalendar?: boolean;
}

export default function EventSubmitProgress({
  currentStep,
  companyName,
  eventType,
  progress = 0,
  syncToCalendar = false,
}: EventSubmitProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // プログレスバーのアニメーション
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  // ステップ定義（カレンダー同期の有無で変化）
  const stepsBase = [
    {
      id: 'validating' as const,
      label: '入力内容確認',
      description: '予定データの検証',
    },
    {
      id: 'registering' as const,
      label: '予定登録',
      description: 'データベースへの保存',
    },
  ];

  const syncStep = {
    id: 'syncing' as const,
    label: 'カレンダー同期',
    description: 'Googleカレンダーへの追加',
  };

  const completedStep = {
    id: 'completed' as const,
    label: '登録完了',
    description: '予定の詳細ページへ',
  };

  const steps = syncToCalendar
    ? [...stepsBase, syncStep, completedStep]
    : [...stepsBase, completedStep];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const currentStepData = steps[currentStepIndex];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in">
      {/* ヘッダーエリア */}
      <div className="bg-slate-800 px-6 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <h1 className="text-white font-medium tracking-wide text-xs sm:text-sm">就活予定登録システム</h1>
        </div>
        <div className="text-slate-400 text-xs hidden sm:block">登録ID: #{eventType.slice(0, 2).toUpperCase()}-{Date.now().toString().slice(-4)}</div>
      </div>

      <div className="p-6 sm:p-12">
        {/* 登録内容の表示 */}
        <div className="mb-8 text-center animate-slide-up">
          <p className="text-slate-500 text-xs sm:text-sm font-medium mb-1">登録内容</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            {companyName}
          </h2>
          <p className="text-slate-600 text-sm mt-2 font-medium">
            {eventType}
          </p>
        </div>

        {/* 進捗パーセンテージ表示（大きく） */}
        <div className="mb-8 text-center animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <p className="text-sm sm:text-base text-slate-500 font-medium mb-3">登録進捗率</p>
          <div className="inline-flex items-baseline">
            <span className="text-6xl sm:text-7xl font-bold text-green-700 tabular-nums">
              {Math.round(animatedProgress)}
            </span>
            <span className="text-3xl sm:text-4xl font-bold text-green-700 ml-2">%</span>
          </div>

          {/* ステータスメッセージ（処理中 or 完了） */}
          <div className="mt-6">
            {currentStep === 'completed' ? (
              <div className="animate-scale-in">
                <div className="inline-flex items-center justify-center px-3 py-1.5 mb-3 bg-green-50 text-green-700 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-xs font-bold tracking-wider">完了</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">
                  予定を正常に登録しました
                </h3>
                <p className="text-slate-500 text-sm flex items-center justify-center gap-2 mt-2">
                  詳細ページへ遷移しています
                  <span className="flex space-x-1">
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </p>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="inline-flex items-center justify-center px-3 py-1.5 mb-2 bg-green-50 text-green-700 rounded-full">
                  <span className="text-xs font-bold tracking-wider">処理中</span>
                </div>
                <h3 className="text-lg font-bold text-slate-700">
                  {currentStepData.label}を実行中...
                </h3>
              </div>
            )}
          </div>
        </div>

        {/* ステッパー（進捗表示） */}
        <div className="relative mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {/* 背景の線 */}
          <div className="absolute top-5 left-0 w-full h-1 bg-slate-200 rounded-full"></div>

          {/* 進捗を示す緑の線 */}
          <div
            className="absolute top-5 left-0 h-1 bg-gradient-to-r from-green-600 to-green-700 rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${animatedProgress}%` }}
          ></div>

          {/* ステップアイコンの配置 */}
          <div className="relative flex justify-between w-full">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isFinished = index < currentStepIndex;

              // アイコンSVG
              const icons = [
                // 入力内容確認
                <svg key="1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>,
                // 予定登録
                <svg key="2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>,
                // カレンダー同期
                <svg key="3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-7.5h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                </svg>,
                // 登録完了
                <svg key="4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>,
              ];

              return (
                <div key={step.id} className="flex flex-col items-center group">
                  {/* アイコンサークル */}
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-500
                      ${isFinished
                        ? 'bg-green-700 border-green-700 text-white'
                        : isActive
                          ? 'bg-white border-green-700 text-green-700 shadow-[0_0_0_4px_rgba(21,128,61,0.1)]'
                          : 'bg-white border-slate-200 text-slate-300'}
                    `}
                  >
                    {isFinished ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      icons[index]
                    )}
                  </div>

                  {/* テキストラベル */}
                  <div className="mt-4 text-center w-24 sm:w-32">
                    <p className={`text-xs sm:text-sm font-bold transition-colors duration-300 ${isFinished || isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 hidden md:block">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* フッター */}
      <div className="bg-slate-50 border-t border-slate-100 px-6 sm:px-8 py-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center text-xs text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1.5 text-green-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <span>予定登録には通常数秒かかります。画面を閉じずにお待ちください。</span>
        </div>
      </div>
    </div>
  );
}
