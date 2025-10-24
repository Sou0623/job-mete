import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// アイコンコンポーネント
const Icons = {
  Sparkles: (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" /></svg>),
  ClipboardList: (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></svg>),
  Target: (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>),
  ArrowRight: (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>),
};

// メインCTAボタン
const CallToActionButton = ({ onClick, isProcessing }: { onClick: () => void; isProcessing: boolean }) => (
  <button
    onClick={onClick}
    disabled={isProcessing}
    className="w-full max-w-sm bg-amber-500 text-white rounded-full px-6 py-4 flex items-center justify-center hover:bg-amber-600 transition-all duration-300 shadow-lg disabled:opacity-50 group text-lg font-bold transform hover:scale-105"
  >
    {isProcessing ? (
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
    ) : (
      <>
        さっそく体験してみる
        <Icons.ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1" />
      </>
    )}
  </button>
);


export default function LoginPage() {
  const { user, login, loading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoginProcessing, setIsLoginProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && user) navigate('/dashboard');
  }, [user, isAuthLoading, navigate]);

  const handleLogin = async () => {
    setIsLoginProcessing(true);
    setError(null);
    try { await login(); } 
    catch (error) {
      console.error('ログインエラー:', error);
      setError('ログインに失敗しました。ポップアップがブロックされていないか確認し、もう一度お試しください。');
      setIsLoginProcessing(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#1A447210' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#1A4472' }}></div>
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-800 font-sans">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#1A4472] text-white rounded-lg p-2 shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#1A4472]">Job Mete</h1>
          </div>
          <button onClick={handleLogin} disabled={isLoginProcessing} className="text-white font-bold py-2 px-5 rounded-lg transition-colors disabled:opacity-50" style={{ backgroundColor: '#1A4472' }}>
            {isLoginProcessing ? '...' : 'ログイン / 新規登録'}
          </button>
        </div>
      </header>

      <main>
        {/* 1. アプリの概要 (Hero) */}
        <section className="pt-36 pb-24 text-center" style={{ background: 'linear-gradient(to bottom, #1A447210, white)' }}>
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              その就活、<span style={{ color: '#1A4472' }}>もっと賢く、もっと自分らしく。</span>
            </h2>
            <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
              Job Meteは、AIがあなたの就活パートナーになるアプリです。<br />
              散らばる情報を一つにまとめ、あなたの「本当の強み」を見つけ出します。
            </p>
            <div className="mt-12 flex flex-col items-center">
              <CallToActionButton onClick={handleLogin} isProcessing={isLoginProcessing} />
              {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
              <p className="text-sm text-slate-500 mt-4">※ Googleアカウントで簡単にはじめられます</p>
            </div>
          </div>
        </section>

        {/* 2. 現状の課題 (共感) */}
        <section className="py-20 px-6 bg-slate-50">
          <div className="container mx-auto text-center max-w-4xl">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">「なんで就活って、こんなに大変なんだろう？」</h3>
            <p className="text-lg text-slate-600">
              心からそう思ったことはありませんか？<br/>
              本来は自分の未来を考える大切な時間なのに、現実は...
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12 text-left">
                <div className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <h4 className="font-bold text-lg text-slate-700">情報整理に追われる日々</h4>
                    <p className="mt-2 text-slate-500">企業の資料、面接のメモ、選考スケジュール...。気づけば情報がバラバラで、本当に大切なことを見失いがち。</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <h4 className="font-bold text-lg text-slate-700">終わらない企業研究</h4>
                    <p className="mt-2 text-slate-500">何社も企業サイトを巡り、ニュースを検索する作業。もっと効率よく、企業の「本質」だけを知りたい。</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <h4 className="font-bold text-lg text-slate-700">見失いがちな「自分の軸」</h4>
                    <p className="mt-2 text-slate-500">多くの情報に触れすぎて、「自分は何がしたいんだっけ？」と不安になる。ESや面接で、自信を持って話せない。</p>
                </div>
            </div>
          </div>
        </section>
        
        {/* 3. 解決策 (希望の提示) */}
        <section className="py-24 px-6">
          <div className="container mx-auto text-center max-w-5xl">
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-800 leading-snug">
              その悩み、Job Meteが<br/>
              <span className="text-amber-500">「強み」</span>に変えます。
            </h3>
            <p className="mt-6 text-lg text-slate-600">
              Job Meteは、ただの管理ツールではありません。<br/>
              AIの力で、あなたの就活を「自分と向き合う最高の機会」へと変えるパートナーです。
            </p>
            <div className="grid md:grid-cols-3 gap-10 mt-16">
              <div className="text-center">
                <div className="bg-amber-100 text-amber-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Icons.Sparkles className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold mb-2">AIが、企業の本質を瞬時に分析</h4>
                <p className="text-slate-600">企業名を登録するだけ。最新ニュースや事業の強みをAIが自動で要約。あなたは「なぜ、この会社で働きたいのか」を深掘りすることに集中できます。</p>
              </div>
              <div className="text-center">
                <div className="bg-amber-100 text-amber-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Icons.ClipboardList className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold mb-2">すべての情報が、一箇所に集まる安心感</h4>
                <p className="text-slate-600">分析、メモ、予定。すべてが企業情報に紐づいて一元管理。Googleカレンダーにも自動同期。「あの情報どこだっけ？」は、もうありません。</p>
              </div>
              <div className="text-center">
                <div className="bg-amber-100 text-amber-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Icons.Target className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold mb-2">AIが、あなたの「軸」を可視化</h4>
                <p className="text-slate-600">登録した企業データから、AIがあなたの興味関心を分析。「SaaS」「社会貢献」など、自分でも気づかなかった"志望動機の原石"を見つけ出します。</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. 理想の状態 (未来の提示) */}
        <section className="py-20 px-6 text-white" style={{ backgroundColor: '#1A4472' }}>
          <div className="container mx-auto text-center max-w-3xl">
            <h3 className="text-3xl font-bold mb-6">Job Meteと始める、新しい就活。</h3>
            <p className="text-lg text-white/80 leading-relaxed">
              もう、情報整理に悩まない。スケジュール管理に追われない。<br/>
              創り出した時間で、もっと自分と向き合い、未来について語り合おう。<br/>
              Job Meteは、あなたが自信を持ってキャリアの第一歩を踏み出す、その瞬間まで伴走します。
            </p>
            <div className="mt-12 flex flex-col items-center">
              <CallToActionButton onClick={handleLogin} isProcessing={isLoginProcessing} />
              {error && <p className="mt-4 text-red-300 text-sm">{error}</p>}
               <p className="text-sm text-white/70 mt-4">※ 登録は無料です。いつでも利用をやめられます。</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-800 text-slate-400 py-6">
        <div className="container mx-auto px-6 text-center text-sm">
            &copy; {new Date().getFullYear()} Job Mete. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}

