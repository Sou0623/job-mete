/**
 * Playwright E2Eテストのサンプル
 *
 * このファイルはPlaywrightが正常に動作するか確認するためのサンプルです。
 * 実際のアプリケーションのE2Eテストは、ログインやFirebase認証が必要になるため、
 * 現時点では基本的な動作確認のみを行います。
 */

import { test, expect } from '@playwright/test';

test.describe('基本的なページアクセステスト', () => {
  test('トップページにアクセスできる', async ({ page }) => {
    await page.goto('/');

    // ページタイトルが存在することを確認
    await expect(page).toHaveTitle(/Job Mete/i);
  });

  test('ページが正常にレンダリングされる', async ({ page }) => {
    await page.goto('/');

    // ページのコンテンツが表示されることを確認
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('JavaScriptエラーが発生しない', async ({ page }) => {
    const errors: string[] = [];

    // コンソールエラーをキャプチャ
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // ページエラーをキャプチャ
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');

    // ページが完全にロードされるまで待機
    await page.waitForLoadState('networkidle');

    // エラーが発生していないことを確認
    expect(errors).toHaveLength(0);
  });
});

test.describe('レスポンシブデザインテスト', () => {
  test('モバイルサイズで正常に表示される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('タブレットサイズで正常に表示される', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('デスクトップサイズで正常に表示される', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });
});

/**
 * 注意: 以下のテストはFirebase認証が必要なため、コメントアウトしています。
 * 実際の運用時には、テスト用のユーザーアカウントを作成し、
 * 環境変数で認証情報を管理してテストを実装してください。
 */

// test.describe('ログイン機能テスト', () => {
//   test('ログインフォームが表示される', async ({ page }) => {
//     await page.goto('/login');
//     await expect(page.locator('input[type="email"]')).toBeVisible();
//     await expect(page.locator('input[type="password"]')).toBeVisible();
//   });
//
//   test('有効な認証情報でログインできる', async ({ page }) => {
//     await page.goto('/login');
//     await page.fill('input[type="email"]', process.env.TEST_EMAIL!);
//     await page.fill('input[type="password"]', process.env.TEST_PASSWORD!);
//     await page.click('button[type="submit"]');
//
//     // ダッシュボードにリダイレクトされることを確認
//     await expect(page).toHaveURL(/\/dashboard/);
//   });
// });

// test.describe('企業登録機能テスト', () => {
//   test.beforeEach(async ({ page }) => {
//     // ログイン処理
//     await page.goto('/login');
//     await page.fill('input[type="email"]', process.env.TEST_EMAIL!);
//     await page.fill('input[type="password"]', process.env.TEST_PASSWORD!);
//     await page.click('button[type="submit"]');
//     await expect(page).toHaveURL(/\/dashboard/);
//   });
//
//   test('新しい企業を登録できる', async ({ page }) => {
//     await page.goto('/companies/new');
//     await page.fill('input[name="companyName"]', 'テスト株式会社');
//     await page.click('button[type="submit"]');
//
//     // 企業一覧にリダイレクトされることを確認
//     await expect(page).toHaveURL(/\/companies/);
//   });
// });
