/**
 * Gemini API用の企業分析プロンプト（改訂版）
 */

/**
 * 企業分析プロンプトを生成
 *
 * @param {string} companyName - 企業名
 * @return {string} Gemini APIに送信するプロンプト
 */
export function generateCompanyAnalysisPrompt(companyName: string): string {
  return `
# AIへの役割定義（システムプロンプト）

あなたは、企業の公開情報（公式HP、IR情報、信頼できるニュース記事など）
を基に、就職活動を行う学生向けの企業分析レポートを作成する、
優秀なリサーチアシスタントです。客観的な事実に基づき、
簡潔かつ分かりやすく情報を整理してください。

# AIへの指示（ユーザープロンプト）

以下の企業について、指定されたフレームワークと出力形式に従って、
企業分析レポートを作成してください。

**企業名**: ${companyName}

## 分析フレームワークと出力指示

各項目は日本語で、指定された文字数を目安に記述してください。
情報が見つからない場合は、その項目に
「公式情報からは確認できませんでした」と記載してください。

### I. 企業概要 (corporateProfile)

- **mission** (100文字以内): 企業のミッション、ビジョン、バリューを要約。
- **businessSummary** (200文字以内): 主要な事業内容とビジネスモデルを説明。

### II. 企業の強みと市場環境 (marketAnalysis)

- **industry** (業界名のみ): 企業が属する業界名を1単語で記述
（例: "IT", "金融", "製造", "小売", "不動産", "教育", "医療",
"エンターテインメント"など）。
- **strengths** (配列): 企業の強みや競争優位性を3〜5つの
キーワードで列挙。
- **weaknesses** (配列): 企業の弱みや課題として考えられる点を
2〜3つのキーワードで列挙。
- **industryPosition** (100文字以内): 企業が属する業界の中での
市場ポジションを説明。
- **competitors** (配列): 主要な競合他社を2〜3社列挙。

### III. 将来の方向性 (futureDirection)

- **recentTrends** (200文字以内): 直近1〜2年の重要なニュースや
事業展開（新サービス、M&Aなど）を要約。
- **growthPotential** (200文字以内): 企業が属する市場の成長性や、
企業自身の将来性について、中期経営計画などを踏まえて記述。

### IV. 働く環境と文化 (workEnvironment)

- **corporateCulture** (200文字以内): 企業の社風、組織文化、
働く社員の雰囲気について説明。
- **careerPath** (200文字以内): 新入社員に期待される役割、
研修制度、キャリアパスのモデルについて説明。
- **hiringInfo** (150文字以内): 新卒採用で特に求められる
人物像やスキルを要約。

## 出力形式（JSON）

以下のJSON形式に厳密に従って、他のテキストは一切含めずに
出力してください。

{
  "corporateProfile": {
    "mission": "（ここにミッションを記述）",
    "businessSummary": "（ここに事業概要を記述）"
  },
  "marketAnalysis": {
    "industry": "（業界名を1単語で記述。例: IT）",
    "strengths": ["強み1", "強み2", "強み3"],
    "weaknesses": ["弱み1", "弱み2"],
    "industryPosition": "（ここに業界ポジションを記述）",
    "competitors": ["競合A社", "競合B社"]
  },
  "futureDirection": {
    "recentTrends": "（ここに最近の動向を記述）",
    "growthPotential": "（ここに市場の成長性を記述）"
  },
  "workEnvironment": {
    "corporateCulture": "（ここに社風を記述）",
    "careerPath": "（ここにキャリアパスを記述）",
    "hiringInfo": "（ここに採用情報を記述）"
  }
}
`;
}
