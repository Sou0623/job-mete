/**
 * 企業名正規化ユーティリティ
 * 企業名の表記ゆれを吸収し、重複チェックに使用
 */

/**
 * 企業名を正規化
 *
 * - 小文字に変換
 * - 「株式会社」「かぶしきがいしゃ」「㈱」を除去
 * - スペースを除去
 * - 記号を除去
 *
 * @param name - 企業名
 * @returns 正規化された企業名
 *
 * @example
 * normalizeCompanyName("株式会社メルカリ") // => "めるかり"
 * normalizeCompanyName("メルカリ株式会社") // => "めるかり"
 * normalizeCompanyName("㈱メルカリ") // => "めるかり"
 */
export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/株式会社|かぶしきがいしゃ|㈱|有限会社|ゆうげんがいしゃ|合同会社|ごうどうがいしゃ/g, "")
    .replace(/\s+/g, "")
    .replace(/[\.、。・]/g, "");
}
