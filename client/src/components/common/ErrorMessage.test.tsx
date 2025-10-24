/**
 * ErrorMessage コンポーネントのユニットテスト
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  describe('基本的な表示', () => {
    it('エラーメッセージを表示できる', () => {
      render(<ErrorMessage message="テストエラーメッセージ" />);

      expect(screen.getByText('テストエラーメッセージ')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('デフォルトでerrorタイプとして表示される', () => {
      render(<ErrorMessage message="エラー" />);

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-red-50');
      expect(screen.getByText('❌')).toBeInTheDocument();
    });
  });

  describe('タイプ別の表示', () => {
    it('warningタイプで表示できる', () => {
      render(<ErrorMessage message="警告メッセージ" type="warning" />);

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-yellow-50');
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('infoタイプで表示できる', () => {
      render(<ErrorMessage message="情報メッセージ" type="info" />);

      const alert = screen.getByRole('alert');
      expect(alert.className).toContain('bg-blue-50');
      expect(screen.getByText('ℹ️')).toBeInTheDocument();
    });
  });

  describe('閉じるボタン', () => {
    it('dismissibleがfalseの場合、閉じるボタンが表示されない', () => {
      render(<ErrorMessage message="エラー" />);

      expect(screen.queryByLabelText('閉じる')).not.toBeInTheDocument();
    });

    it('dismissibleがtrueの場合、閉じるボタンが表示される', () => {
      const onDismiss = vi.fn();
      render(
        <ErrorMessage
          message="エラー"
          dismissible={true}
          onDismiss={onDismiss}
        />
      );

      expect(screen.getByLabelText('閉じる')).toBeInTheDocument();
    });

    it('閉じるボタンをクリックするとonDismissが呼ばれる', async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();

      render(
        <ErrorMessage
          message="エラー"
          dismissible={true}
          onDismiss={onDismiss}
        />
      );

      const closeButton = screen.getByLabelText('閉じる');
      await user.click(closeButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('アクションボタン', () => {
    it('actionが指定されている場合、アクションボタンが表示される', () => {
      const action = {
        label: 'リトライ',
        onClick: vi.fn(),
      };

      render(<ErrorMessage message="エラー" action={action} />);

      expect(screen.getByText('リトライ')).toBeInTheDocument();
    });

    it('アクションボタンをクリックするとonClickが呼ばれる', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const action = {
        label: 'リトライ',
        onClick,
      };

      render(<ErrorMessage message="エラー" action={action} />);

      const actionButton = screen.getByText('リトライ');
      await user.click(actionButton);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('actionが指定されていない場合、アクションボタンが表示されない', () => {
      render(<ErrorMessage message="エラー" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('フルスクリーン表示', () => {
    it('fullScreenがfalseの場合、通常表示される', () => {
      const { container } = render(<ErrorMessage message="エラー" />);

      // フルスクリーン用のwrapperクラスが存在しない
      expect(container.querySelector('.min-h-screen')).not.toBeInTheDocument();
    });

    it('fullScreenがtrueの場合、フルスクリーン表示される', () => {
      const { container } = render(
        <ErrorMessage message="エラー" fullScreen={true} />
      );

      // フルスクリーン用のwrapperクラスが存在する
      const fullScreenWrapper = container.querySelector('.min-h-screen');
      expect(fullScreenWrapper).toBeInTheDocument();
      expect(fullScreenWrapper?.className).toContain('bg-slate-50');
    });
  });

  describe('複合的なテスト', () => {
    it('すべてのプロパティを組み合わせて使用できる', async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();
      const actionClick = vi.fn();

      render(
        <ErrorMessage
          message="複雑なエラーメッセージ"
          type="warning"
          dismissible={true}
          onDismiss={onDismiss}
          action={{
            label: 'もう一度試す',
            onClick: actionClick,
          }}
          fullScreen={true}
        />
      );

      // メッセージが表示されている
      expect(screen.getByText('複雑なエラーメッセージ')).toBeInTheDocument();

      // warningタイプのアイコンが表示されている
      expect(screen.getByText('⚠️')).toBeInTheDocument();

      // 閉じるボタンが表示されている
      expect(screen.getByLabelText('閉じる')).toBeInTheDocument();

      // アクションボタンが表示されている
      const actionButton = screen.getByText('もう一度試す');
      expect(actionButton).toBeInTheDocument();

      // アクションボタンをクリック
      await user.click(actionButton);
      expect(actionClick).toHaveBeenCalledTimes(1);

      // 閉じるボタンをクリック
      const closeButton = screen.getByLabelText('閉じる');
      await user.click(closeButton);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });
});
