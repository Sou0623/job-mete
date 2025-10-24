/**
 * Loading コンポーネントのユニットテスト
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loading from './Loading';

describe('Loading', () => {
  describe('基本的な表示', () => {
    it('デフォルトでローディングスピナーを表示できる', () => {
      const { container } = render(<Loading />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('デフォルトメッセージを表示できる', () => {
      render(<Loading />);

      expect(screen.getByText('データを読み込んでいます...')).toBeInTheDocument();
    });
  });

  describe('サイズバリエーション', () => {
    it('smサイズで表示できる', () => {
      const { container } = render(<Loading size="sm" />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner?.className).toContain('h-8');
      expect(spinner?.className).toContain('w-8');
    });

    it('mdサイズで表示できる（デフォルト）', () => {
      const { container } = render(<Loading size="md" />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner?.className).toContain('h-12');
      expect(spinner?.className).toContain('w-12');
    });

    it('lgサイズで表示できる', () => {
      const { container } = render(<Loading size="lg" />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner?.className).toContain('h-16');
      expect(spinner?.className).toContain('w-16');
    });
  });

  describe('メッセージ表示', () => {
    it('showMessageがtrueの場合、メッセージが表示される', () => {
      render(<Loading showMessage={true} />);

      expect(screen.getByText('データを読み込んでいます...')).toBeInTheDocument();
    });

    it('showMessageがfalseの場合、メッセージが表示されない', () => {
      render(<Loading showMessage={false} />);

      expect(screen.queryByText('データを読み込んでいます...')).not.toBeInTheDocument();
    });

    it('カスタムメッセージを表示できる', () => {
      render(<Loading message="処理中..." />);

      expect(screen.getByText('処理中...')).toBeInTheDocument();
      expect(screen.queryByText('データを読み込んでいます...')).not.toBeInTheDocument();
    });

    it('カスタムメッセージとshowMessageを組み合わせられる', () => {
      render(<Loading message="カスタムメッセージ" showMessage={false} />);

      expect(screen.queryByText('カスタムメッセージ')).not.toBeInTheDocument();
    });
  });

  describe('フルスクリーン表示', () => {
    it('fullScreenがfalseの場合、通常表示される', () => {
      const { container } = render(<Loading />);

      expect(container.querySelector('.min-h-screen')).not.toBeInTheDocument();
    });

    it('fullScreenがtrueの場合、フルスクリーン表示される', () => {
      const { container } = render(<Loading fullScreen={true} />);

      const fullScreenWrapper = container.querySelector('.min-h-screen');
      expect(fullScreenWrapper).toBeInTheDocument();
      expect(fullScreenWrapper?.className).toContain('bg-slate-50');
    });
  });

  describe('複合的なテスト', () => {
    it('すべてのプロパティを組み合わせて使用できる', () => {
      const { container } = render(
        <Loading
          size="lg"
          message="大規模なデータを処理中..."
          showMessage={true}
          fullScreen={true}
        />
      );

      // lgサイズのスピナーが表示されている
      const spinner = container.querySelector('.animate-spin');
      expect(spinner?.className).toContain('h-16');
      expect(spinner?.className).toContain('w-16');

      // カスタムメッセージが表示されている
      expect(screen.getByText('大規模なデータを処理中...')).toBeInTheDocument();

      // フルスクリーン表示されている
      expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
    });

    it('最小構成で使用できる（スピナーのみ）', () => {
      const { container } = render(
        <Loading
          size="sm"
          showMessage={false}
        />
      );

      // smサイズのスピナーが表示されている
      const spinner = container.querySelector('.animate-spin');
      expect(spinner?.className).toContain('h-8');

      // メッセージは表示されていない
      expect(screen.queryByText(/読み込んでいます/)).not.toBeInTheDocument();

      // 通常表示（フルスクリーンではない）
      expect(container.querySelector('.min-h-screen')).not.toBeInTheDocument();
    });
  });

  describe('アニメーション', () => {
    it('スピナーにanimate-spinクラスが適用されている', () => {
      const { container } = render(<Loading />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('メッセージにanimate-pulseクラスが適用されている', () => {
      const { container } = render(<Loading showMessage={true} />);

      const message = container.querySelector('.animate-pulse');
      expect(message).toBeInTheDocument();
      expect(message?.textContent).toBe('データを読み込んでいます...');
    });
  });
});
