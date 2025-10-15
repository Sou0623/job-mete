/**
 * Gemini API用の傾向分析プロンプト生成
 */

/**
 * 企業データから傾向分析プロンプトを生成
 *
 * @param companies - 企業データの配列
 * @returns Gemini API用のプロンプト
 */
export function generateTrendAnalysisPrompt(
  companies: Array<{
    companyName: string;
    analysis: {
      businessOverview: string;
      industryPosition: string;
      strengths: string[];
    };
  }>
): string {
  const companyList = companies
    .map(
      (company, index) =>
        `${index + 1}. ${company.companyName}\n` +
        `   業界: ${company.analysis.industryPosition}\n` +
        `   事業内容: ${company.analysis.businessOverview}\n` +
        `   強み: ${company.analysis.strengths.join(", ")}`
    )
    .join("\n\n");

  return `あなたは就職活動のキャリアアドバイザーです。
学生が興味を持っている企業リストから、志望傾向を分析してください。

# 登録企業リスト（${companies.length}社）

${companyList}

# 分析指示

以下のJSON形式で傾向分析結果を返してください：

{
  "overallTrend": "学生の志望傾向を200文字以内で要約（どのような業界・企業に興味があるか）",
  "topIndustries": [
    {
      "name": "IT・ソフトウェア",
      "count": 5,
      "percentage": 50.0
    }
  ],
  "commonKeywords": [
    {
      "word": "DX",
      "count": 8
    }
  ],
  "recommendedSkills": [
    "プログラミング（Python, JavaScript）",
    "データ分析",
    "コミュニケーション能力"
  ]
}

## 分析ポイント

1. **overallTrend**: 学生がどのような業界・企業に興味を持っているか、共通点は何かを200文字以内で要約
2. **topIndustries**: 業界別の分布（上位5業界まで、percentageは小数点第1位まで）
3. **commonKeywords**: 企業の特徴や強みから頻出するキーワードを抽出（上位10個まで）
4. **recommendedSkills**: これらの企業で求められるスキルを5個程度提案

必ず上記のJSON形式で返してください。他の説明文は不要です。`;
}
