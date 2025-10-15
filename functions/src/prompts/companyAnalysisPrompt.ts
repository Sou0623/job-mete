/**
 * Gemini API用の企業分析プロンプト
 */

/**
 * 企業分析プロンプトを生成
 *
 * @param companyName - 企業名
 * @returns Gemini APIに送信するプロンプト
 */
export function generateCompanyAnalysisPrompt(companyName: string): string {
  return `
あなたは就職活動をサポートするAIアシスタントです。
以下の企業について、最新の情報を調査し、就活生向けに分析してください。

企業名: ${companyName}

以下の項目について、日本語で回答してください：

1. **事業内容** (businessOverview):
   - 企業の主要事業を200文字以内で簡潔に説明
   - 何をしている会社なのかが分かるように

2. **強み** (strengths):
   - 企業の競争優位性や特徴を3〜5個のキーワードで列挙
   - 例: "技術力", "グローバル展開", "顧客基盤"

3. **最近の動向** (recentNews):
   - 直近1年以内のニュースやトピックを150文字以内で要約
   - 新製品、業績、M&A、人事など

4. **業界ポジション** (industryPosition):
   - 業界名と市場でのポジションを50文字以内で説明
   - 例: "Eコマース業界、国内最大手"

5. **採用情報** (recruitmentInsights):
   - 新卒採用の特徴や求める人物像を150文字以内で説明
   - 採用情報が見つからない場合は「情報が見つかりませんでした」と記載

**重要**: 回答は以下のJSON形式で出力してください（他のテキストは一切含めないこと）：

{
  "businessOverview": "事業内容の説明",
  "strengths": ["強み1", "強み2", "強み3"],
  "recentNews": "最近の動向",
  "industryPosition": "業界ポジション",
  "recruitmentInsights": "採用情報"
}
`;
}
