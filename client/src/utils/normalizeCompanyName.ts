/**
 * 企業名を正規化して重複チェック用の文字列を生成
 *
 * 以下の処理を実行：
 * - 小文字に変換
 * - 法人格（株式会社、有限会社等）を除去
 * - スペースを除去
 * - 記号（句点、読点、ピリオド、中黒）を除去
 *
 * @param name - 企業名（例: "株式会社〇〇"）
 * @returns 正規化された企業名（例: "〇〇"）
 *
 * @example
 * normalizeCompanyName("株式会社〇〇") // => "〇〇"
 * normalizeCompanyName("㈱△△・ジャパン") // => "△△ジャパン"
 */
export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(
      /株式会社|かぶしきがいしゃ|㈱|有限会社|ゆうげんがいしゃ|合同会社|ごうどうがいしゃ/g,
      ""
    )
    .replace(/\s+/g, "")
    .replace(/[.、。・]/g, "");
}
