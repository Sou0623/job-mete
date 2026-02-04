/**
 * 傾向分析進行状況表示コンポーネント
 * AI傾向分析の実行プロセスを視覚的に表示
 */

import { useEffect, useState } from 'react';

type AnalysisStep = 'collecting' | 'analyzing' | 'generating' | 'completed';

interface TrendAnalysisProgressProps {
  /** 現在のステップ */
  currentStep: AnalysisStep;
  /** プログレス（0-100） */
  progress?: number;
  /** 分析対象企業数 */
  companyCount?: number;
  /** レビュー数 */
  reviewCount?: number;
}

export default function TrendAnalysisProgress({
  currentStep,
  progress = 0,
  companyCount = 0,
  reviewCount = 0,
}: TrendAnalysisProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // プログレスバーのアニメーション
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  // ステップ定義
  const steps = [
    {
      id: 'collecting' as const,
      label: 'データ収集',
      description: '企業・レビュー情報の集計',
    },
    {
      id: 'analyzing' as const,
      label: 'AI分析実行',
      description: '傾向パターンの抽出',
    },
    {
      id: 'generating' as const,
      label: 'レポート生成',
      description: 'アドバイスの作成',
    },
    {
      id: 'completed' as const,
      label: '分析完了',
      description: '結果の表示準備',
    },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const currentStepData = steps[currentStepIndex];

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in">
      {/* ヘッダーエリア */}
      <div className="bg-gradient-to-r from-[#855896] to-[#9c6ba8] px-6 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 text-yellow-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
          <h1 className="text-white font-medium tracking-wide text-xs sm:text-sm">AI傾向分析システム</h1>
        </div>
        <div className="text-[#d4c0dc] text-xs hidden sm:block">分析ID: #TREND-{Date.now().toString().slice(-4)}</div>
      </div>

      <div className="p-6 sm:p-12">
        {/* 分析データの表示 */}
        <div className="mb-8 text-center animate-slide-up">
          <p className="text-slate-500 text-xs sm:text-sm font-medium mb-1">分析対象</p>
          <div className="flex items-center justify-center gap-6 mt-3">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-[#855896] tracking-tight">
                {companyCount}
              </p>
              <p className="text-slate-600 text-sm mt-1">企業</p>
            </div>
            <div className="w-px h-12 bg-slate-300"></div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-[#9c6ba8] tracking-tight">
                {reviewCount}
              </p>
              <p className="text-slate-600 text-sm mt-1">レビュー</p>
            </div>
          </div>
        </div>

        {/* AI分析中のメッセージ */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#f4eff6] to-[#ebe5ed] px-6 py-4 rounded-2xl border-2 border-[#d4c0dc] animate-pulse">
            <div className="w-8 h-8 text-[#855896]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="animate-spin">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-[#6b4575] font-bold text-sm sm:text-base">
                AIがあなたの傾向を分析中！
              </p>
              <p className="text-[#855896] text-xs sm:text-sm mt-0.5">
                パターンを学習して最適なアドバイスを生成しています
              </p>
            </div>
          </div>
        </div>

        {/* 進捗パーセンテージ表示（大きく） */}
        <div className="mb-8 text-center animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <p className="text-sm sm:text-base text-slate-500 font-medium mb-3">分析進捗率</p>
          <div className="inline-flex items-baseline">
            <span className="text-6xl sm:text-7xl font-bold text-[#855896] tabular-nums">
              {Math.round(animatedProgress)}
            </span>
            <span className="text-3xl sm:text-4xl font-bold text-[#855896] ml-2">%</span>
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
                  傾向分析が正常に完了しました
                </h3>
                <p className="text-slate-500 text-sm flex items-center justify-center gap-2 mt-2">
                  結果を表示しています
                  <span className="flex space-x-1">
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </p>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="inline-flex items-center justify-center px-3 py-1.5 mb-2 bg-[#f4eff6] text-[#855896] rounded-full">
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

          {/* 進捗を示すモーブの線 */}
          <div
            className="absolute top-5 left-0 h-1 bg-gradient-to-r from-[#855896] to-[#9c6ba8] rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${animatedProgress}%` }}
          ></div>

          {/* ステップアイコンの配置 */}
          <div className="relative flex justify-between w-full">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isFinished = index < currentStepIndex;

              // アイコンSVG
              const icons = [
                // データ収集
                <svg key="1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>,
                // AI分析
                <svg key="2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>,
                // レポート生成
                <svg key="3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>,
                // 完了
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
                        ? 'bg-[#855896] border-[#855896] text-white'
                        : isActive
                          ? 'bg-white border-[#855896] text-[#855896] shadow-[0_0_0_4px_rgba(133,88,150,0.1)]'
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
                  <div className="mt-4 text-center w-20 sm:w-28">
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
      <div className="bg-gradient-to-r from-[#f4eff6] to-[#ebe5ed] border-t border-[#d4c0dc] px-6 sm:px-8 py-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="flex items-center text-xs text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1.5 text-[#855896]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
          <span>AI傾向分析には通常20〜40秒かかります。画面を閉じずにお待ちください。</span>
        </div>
      </div>
    </div>
  );
}
