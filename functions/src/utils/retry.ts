/**
 * リトライユーティリティ
 * Exponential Backoff でリトライを実装
 */

/**
 * エラーがクォータ制限エラー（429）かどうかを判定
 *
 * @param {Error} error - 判定するエラー
 * @return {boolean} クォータエラーの場合true
 */
function isQuotaError(error: Error): boolean {
  const errorMessage = error.message.toLowerCase();
  return (
    errorMessage.includes("429") ||
    errorMessage.includes("quota") ||
    errorMessage.includes("rate limit") ||
    errorMessage.includes("too many requests")
  );
}

/**
 * 指定した関数を Exponential Backoff でリトライ
 *
 * @param {Function} fn - リトライする関数
 * @param {number} maxRetries - 最大リトライ回数（デフォルト: 3）
 * @param {number} initialDelay - 初回遅延時間（ミリ秒、デフォルト: 1000）
 * @return {Promise<T>} 関数の実行結果
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // クォータエラーの場合は即座にエラーをスロー（リトライしても無駄）
      if (isQuotaError(lastError)) {
        throw new Error(
          "Gemini APIのクォータ制限に達しました。しばらく時間をおいてから再度お試しください。"
        );
      }

      // 最後の試行の場合はエラーをスロー
      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      // Exponential Backoff: 1秒 → 2秒 → 4秒
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`リトライ ${attempt + 1}/${maxRetries} - ${delay}ms 待機中...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
