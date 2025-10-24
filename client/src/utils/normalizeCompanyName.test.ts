/**
 * normalizeCompanyName 関数のユニットテスト
 */

import { describe, it, expect } from 'vitest';
import { normalizeCompanyName } from './normalizeCompanyName';

describe('normalizeCompanyName', () => {
  describe('基本的な正規化', () => {
    it('株式会社を前方から除去できる', () => {
      expect(normalizeCompanyName('株式会社コドモン')).toBe('コドモン');
    });

    it('株式会社を後方から除去できる', () => {
      expect(normalizeCompanyName('コドモン株式会社')).toBe('コドモン');
    });

    it('㈱を除去できる', () => {
      expect(normalizeCompanyName('㈱コドモン')).toBe('コドモン');
    });

    it('有限会社を除去できる', () => {
      expect(normalizeCompanyName('有限会社コドモン')).toBe('コドモン');
    });

    it('合同会社を除去できる', () => {
      expect(normalizeCompanyName('合同会社コドモン')).toBe('コドモン');
    });
  });

  describe('大文字・小文字の正規化', () => {
    it('大文字を小文字に変換できる', () => {
      expect(normalizeCompanyName('CODOMON')).toBe('codomon');
    });

    it('混在する大文字・小文字を正規化できる', () => {
      expect(normalizeCompanyName('CodoMon')).toBe('codomon');
    });
  });

  describe('スペースの除去', () => {
    it('半角スペースを除去できる', () => {
      expect(normalizeCompanyName('コド モン')).toBe('コドモン');
    });

    it('全角スペースを除去できる', () => {
      expect(normalizeCompanyName('コド　モン')).toBe('コドモン');
    });

    it('複数のスペースを除去できる', () => {
      expect(normalizeCompanyName('コド  モン')).toBe('コドモン');
    });
  });

  describe('記号の除去', () => {
    it('ピリオドを除去できる', () => {
      expect(normalizeCompanyName('コドモン.')).toBe('コドモン');
    });

    it('読点を除去できる', () => {
      expect(normalizeCompanyName('コドモン、')).toBe('コドモン');
    });

    it('句点を除去できる', () => {
      expect(normalizeCompanyName('コドモン。')).toBe('コドモン');
    });

    it('中黒を除去できる', () => {
      expect(normalizeCompanyName('コド・モン')).toBe('コドモン');
    });
  });

  describe('複合的なケース', () => {
    it('すべての正規化を組み合わせて適用できる', () => {
      const input = '株式会社 コド モン。';
      const expected = 'コドモン';
      expect(normalizeCompanyName(input)).toBe(expected);
    });

    it('複雑な企業名を正規化できる', () => {
      const input = '㈱メルカリ・ジャパン';
      const expected = 'メルカリジャパン';
      expect(normalizeCompanyName(input)).toBe(expected);
    });
  });

  describe('エッジケース', () => {
    it('空文字列を処理できる', () => {
      expect(normalizeCompanyName('')).toBe('');
    });

    it('法人格のみの入力を処理できる', () => {
      expect(normalizeCompanyName('株式会社')).toBe('');
    });

    it('すでに正規化された文字列をそのまま返す', () => {
      expect(normalizeCompanyName('コドモン')).toBe('コドモン');
    });
  });
});
