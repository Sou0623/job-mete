/**
 * Gemini API クォータ監視ユーティリティ
 * 使用状況をログに記録して、制限を超える前に警告
 */

interface QuotaUsage {
  date: string;
  requests: number;
  errors: number;
  lastReset: string;
}

/**
 * 日次のリクエスト数をカウント（簡易版）
 * 本番環境では Firestore や Redis に保存することを推奨
 */
class ApiQuotaMonitor {
  private usage: Map<string, QuotaUsage> = new Map();
  // 安全マージンを含む（Gemini 2.0 Flash: 1500RPDの約66%）
  private readonly MAX_REQUESTS_PER_DAY = 1000;

  /**
   * 今日の日付キーを取得
   * @return {string} 今日の日付キー（YYYY-MM-DD形式）
   */
  private getTodayKey(): string {
    return new Date().toISOString().split("T")[0];
  }

  /**
   * 現在の使用状況を取得
   * @return {QuotaUsage} 現在の使用状況
   */
  private getUsage(): QuotaUsage {
    const today = this.getTodayKey();
    if (!this.usage.has(today)) {
      this.usage.set(today, {
        date: today,
        requests: 0,
        errors: 0,
        lastReset: new Date().toISOString(),
      });
    }
    return this.usage.get(today)!;
  }

  /**
   * リクエスト前のチェック
   * @return {boolean} リクエスト可能な場合 true
   */
  canMakeRequest(): boolean {
    const usage = this.getUsage();

    if (usage.requests >= this.MAX_REQUESTS_PER_DAY) {
      console.warn(
        `[QuotaMonitor] 日次制限に達しています: ` +
        `${usage.requests}/${this.MAX_REQUESTS_PER_DAY}`
      );
      return false;
    }

    // 警告: 80%に達した場合
    if (usage.requests >= this.MAX_REQUESTS_PER_DAY * 0.8) {
      console.warn(
        `[QuotaMonitor] ⚠️  クォータの80%を使用: ` +
        `${usage.requests}/${this.MAX_REQUESTS_PER_DAY}`
      );
    }

    return true;
  }

  /**
   * リクエスト成功を記録
   * @return {void}
   */
  recordSuccess(): void {
    const usage = this.getUsage();
    usage.requests++;
    console.log(
      `[QuotaMonitor] リクエスト成功: ` +
      `${usage.requests}/${this.MAX_REQUESTS_PER_DAY} ` +
      `(残り: ${this.MAX_REQUESTS_PER_DAY - usage.requests})`
    );
  }

  /**
   * エラーを記録
   * @param {Error} error エラーオブジェクト
   * @return {void}
   */
  recordError(error: Error): void {
    const usage = this.getUsage();
    usage.errors++;

    if (error.message.includes("429")) {
      console.error(
        `[QuotaMonitor] ❌ クォータエラー発生: ` +
        `${usage.requests}リクエスト後`
      );
      console.error("   次回リセット: 太平洋標準時 午前0時");
    }
  }

  /**
   * 使用状況のサマリーを取得
   * @return {string} 使用状況のサマリー
   */
  getSummary(): string {
    const usage = this.getUsage();
    return (
      `クォータ使用状況: ` +
      `${usage.requests}/${this.MAX_REQUESTS_PER_DAY} ` +
      `(エラー: ${usage.errors})`
    );
  }
}

// シングルトンインスタンス
export const quotaMonitor = new ApiQuotaMonitor();
