/**
 * Gemini API用の傾向分析プロンプト生成
 */

/**
 * 企業データから傾向分析プロンプトを生成
 *
 * @param {Array} companies - 企業データの配列
 * @param {Array} reviewedEvents - レビュー済みイベントデータ（マッチ度評価含む）
 * @return {string} Gemini API用のプロンプト
 */
export function generateTrendAnalysisPrompt(
  companies: Array<{
    companyName: string;
    analysis: {
      businessOverview: string;
      industryPosition: string;
      strengths: string[];
    };
  }>,
  reviewedEvents: Array<{
    companyName: string;
    eventType: string;
    jobPosition?: string;
    review: {
      feedback: string;
      companyMatchRate: number;
      jobMatchRate: number;
      reviewedAt: string;
    };
  }> = []
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

  // レビューデータのサマリー生成（マッチ度分析用）
  let reviewDataSection = "";
  if (reviewedEvents.length > 0) {
    // 平均マッチ度計算
    const avgCompanyMatch = (
      reviewedEvents.reduce((sum, e) => sum + e.review.companyMatchRate, 0) /
      reviewedEvents.length
    ).toFixed(1);
    const avgJobMatch = (
      reviewedEvents.reduce((sum, e) => sum + e.review.jobMatchRate, 0) /
      reviewedEvents.length
    ).toFixed(1);

    // 企業別マッチ度集計
    const companyMatchMap = new Map<string, number[]>();
    reviewedEvents.forEach((event) => {
      if (!companyMatchMap.has(event.companyName)) {
        companyMatchMap.set(event.companyName, []);
      }
      const rates = companyMatchMap.get(event.companyName);
      if (rates) {
        rates.push(event.review.companyMatchRate);
      }
    });

    const companyMatchList = Array.from(companyMatchMap.entries())
      .map(([name, rates]) => {
        const avg = (
          rates.reduce((a, b) => a + b, 0) / rates.length
        ).toFixed(1);
        return `   - ${name}: ${avg}/5 (${rates.length}件のレビュー)`;
      })
      .join("\n");

    // 職種別マッチ度集計
    const jobMatchMap = new Map<string, number[]>();
    reviewedEvents.forEach((event) => {
      if (event.jobPosition) {
        if (!jobMatchMap.has(event.jobPosition)) {
          jobMatchMap.set(event.jobPosition, []);
        }
        const rates = jobMatchMap.get(event.jobPosition);
        if (rates) {
          rates.push(event.review.jobMatchRate);
        }
      }
    });

    let jobMatchList = "";
    if (jobMatchMap.size > 0) {
      jobMatchList =
        "\n\n職種別マッチ度:\n" +
        Array.from(jobMatchMap.entries())
          .map(([job, rates]) => {
            const avg = (
              rates.reduce((a, b) => a + b, 0) / rates.length
            ).toFixed(1);
            return `   - ${job}: ${avg}/5 (${rates.length}件のレビュー)`;
          })
          .join("\n");
    }

    reviewDataSection = `

# レビューデータ（マッチ度評価）

レビュー件数: ${reviewedEvents.length}件
平均企業マッチ度: ${avgCompanyMatch}/5
平均職種マッチ度: ${avgJobMatch}/5

企業別マッチ度:
${companyMatchList}${jobMatchList}

※ マッチ度は1〜5の5段階評価
（1=20%, 2=40%, 3=60%, 4=80%, 5=100%）
`;
  }

  return `あなたは就職活動のキャリアアドバイザーです。
学生が興味を持っている企業リストから、志望傾向を分析して
ください。

# 登録企業リスト（${companies.length}社）

${companyList}${reviewDataSection}

# 分析指示

以下のJSON形式で傾向分析結果を返してください：

{
  "overallTrend": "学生の志望傾向を200文字以内で要約
（どのような業界・企業に興味があるか）",
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
  ],
  "matchInsights": {
    "highMatchCompanies": [
      {
        "companyName": "株式会社A",
        "avgMatchRate": 4.5,
        "reason": "マッチ度が高い理由
（企業の特徴と学生の志向性の一致点）"
      }
    ],
    "lowMatchCompanies": [
      {
        "companyName": "株式会社B",
        "avgMatchRate": 2.0,
        "reason": "マッチ度が低い理由（ミスマッチの原因）"
      }
    ],
    "recommendedJobPositions": [
      {
        "position": "バックエンドエンジニア",
        "avgMatchRate": 4.2,
        "reason": "推奨理由（適性や興味との一致点）"
      }
    ],
    "careerAdvice": "マッチ度データから見た、
学生への具体的なアドバイス（150文字以内）"
  }
}

## 分析ポイント

1. **overallTrend**: 学生がどのような業界・企業に興味を
持っているか、共通点は何かを200文字以内で要約
2. **topIndustries**: 業界別の分布（上位10業界まで、
percentageは小数点第1位まで。企業数が多い順に並べてください）
3. **commonKeywords**: 企業の特徴や強みから頻出する
キーワードを抽出（上位10個まで）
4. **recommendedSkills**: これらの企業で求められるスキルを
5個程度提案
5. **matchInsights**（レビューデータがある場合のみ）:
   - **highMatchCompanies**: 企業マッチ度が高い企業
（平均4.0以上）を最大3社、理由とともに提示
   - **lowMatchCompanies**: 企業マッチ度が低い企業
（平均2.5以下）を最大3社、ミスマッチの原因とともに提示
   - **recommendedJobPositions**: 職種マッチ度が高い職種
（平均3.5以上）を最大3職種、推奨理由とともに提示
   - **careerAdvice**: マッチ度データから見た学生への
具体的なキャリアアドバイス（150文字以内）

注意: レビューデータがない場合、matchInsights は null を
返してください。

必ず上記のJSON形式で返してください。
他の説明文は不要です。`;
}
