import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// アイコンコンポーネント
const Icons = {
  Sparkles: (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.9 4.2-4.3.6 3.1 3- .7 4.2 3.8-2 3.8 2-.7-4.2 3.1-3-4.3-.6L12 3z" /><path d="M5 21v-1" /><path d="M19 21v-1" /><path d="m3.2 14.8.8-.6" /><path d="m20 14.2-.8.6" /><path d="m20.8 7.2-.8-.6" /><path d="m3.2 9.2.8.6" /><path d="M12 21v-1" /></svg>),
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
      <div className="flex items-center justify-center min-h-screen bg-sky-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-800 font-sans">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sky-600">Job Mete</h1>
          <button onClick={handleLogin} disabled={isLoginProcessing} className="bg-sky-500 text-white font-bold py-2 px-5 rounded-lg hover:bg-sky-600 transition-colors disabled:bg-sky-300">
            {isLoginProcessing ? '...' : 'ログイン / 新規登録'}
          </button>
        </div>
      </header>

      <main>
        {/* 1. アプリの概要 (Hero) */}
        <section className="pt-36 pb-24 text-center bg-gradient-to-b from-sky-50 to-white">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              その就活、<span className="text-sky-600">もっと賢く、もっと自分らしく。</span>
            </h2>
            <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
              Job Meteは、AIがあなたの就活パートナーになるアプリです。<br />
              散らばる情報を一つにまとめ、あなたの「本当の強み」を見つけ出します。
            </p>
            {/* ▼▼▼ ここを修正しました ▼▼▼ */}
            <div className="mt-12 flex flex-col items-center">
              <CallToActionButton onClick={handleLogin} isProcessing={isLoginProcessing} />
              {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
              <p className="text-sm text-slate-500 mt-4">※ Googleアカウントで簡単にはじめられます</p>
            </div>
            {/* ▲▲▲ ここまで修正 ▲▲▲ */}
          </div>
        </section>

        {/* 2. 現状の課題 (共感) */}
        <section className="py-20 px-6 bg-slate-50">
          <div className="container mx-auto text-center max-w-4xl">
            <h3 className="text-3xl font-bold text-slate-800 mb-4 animate-fade-in">「なんで就活って、こんなに大変なんだろう？」</h3>
            <p className="text-lg text-slate-600 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              心からそう思ったことはありませんか？<br/>
              本来は自分の未来を考える大切な時間なのに、現実は...
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12 text-left">
                <div className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <h4 className="font-bold text-lg text-slate-700">情報整理に追われる日々</h4>
                    <p className="mt-2 text-slate-500">企業の資料、面接のメモ、選考スケジュール...。気づけば情報がバラバラで、本当に大切なことを見失いがち。</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                    <h4 className="font-bold text-lg text-slate-700">終わらない企業研究</h4>
                    <p className="mt-2 text-slate-500">何社も企業サイトを巡り、ニュースを検索する作業。もっと効率よく、企業の「本質」だけを知りたい。</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.8s' }}>
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
        <section className="py-20 px-6 bg-sky-600 text-white">
          <div className="container mx-auto text-center max-w-3xl">
            <h3 className="text-3xl font-bold mb-6">Job Meteと始める、新しい就活。</h3>
            <p className="text-lg text-sky-100 leading-relaxed">
              もう、情報整理に悩まない。スケジュール管理に追われない。<br/>
              創り出した時間で、もっと自分と向き合い、未来について語り合おう。<br/>
              Job Meteは、あなたが自信を持ってキャリアの第一歩を踏み出す、その瞬間まで伴走します。
            </p>
            <div className="mt-12 flex flex-col items-center">
              <CallToActionButton onClick={handleLogin} isProcessing={isLoginProcessing} />
              {error && <p className="mt-4 text-red-300 text-sm">{error}</p>}
               <p className="text-sm text-sky-200 mt-4">※ 登録は無料です。いつでも利用をやめられます。</p>
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