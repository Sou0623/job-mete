/**
 * バリデーションユーティリティ
 */

/**
 * 企業名のバリデーション
 *
 * @param companyName - 企業名
 * @returns バリデーション結果
 */
export function validateCompanyName(companyName: string): {
  valid: boolean;
  error?: string;
} {
  if (!companyName || typeof companyName !== "string") {
    return {valid: false, error: "企業名は必須です"};
  }

  const trimmed = companyName.trim();

  if (trimmed.length === 0) {
    return {valid: false, error: "企業名は必須です"};
  }

  if (trimmed.length > 100) {
    return {valid: false, error: "企業名は100文字以内で入力してください"};
  }

  return {valid: true};
}
