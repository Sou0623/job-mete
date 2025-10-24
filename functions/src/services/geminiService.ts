/*
 * Gemini API統合サービス
 */

import {GoogleGenerativeAI} from "@google/generative-ai";
import {generateCompanyAnalysisPrompt} from "../prompts/companyAnalysisPrompt";
import {retryWithBackoff} from "../utils/retry";
import type {CompanyAnalysis} from "../types";

/**
 * Gemini APIクライアントの初期化
 * @return {GoogleGenerativeAI} Gemini APIクライアント
 */
function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  return new GoogleGenerativeAI(apiKey);
}

/**
 * 企業分析をGemini APIで実行
 *
 * @param {string} companyName - 企業名
 * @return {Promise<Object>} 企業分析結果
 */
export async function analyzeCompanyWithGemini(
  companyName: string
): Promise<{
  analysis: CompanyAnalysis;
  metadata: {
    modelUsed: string;
    tokensUsed: number;
    searchSources: string[];
    prompt: string;
    rawResponse: string;
  };
}> {
  // Gemini APIクライアントを初期化
  const genAI = getGeminiClient();

  // モデルを取得（Gemini 2.0 Flash with Grounding）
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  // プロンプトを生成
  const prompt = generateCompanyAnalysisPrompt(companyName);

  // ログ: 送信するプロンプト
  console.log("==================== Gemini API Request ====================");
  console.log(`企業名: ${companyName}`);
  console.log("--- プロンプト ---");
  console.log(prompt);
  console.log("===========================================================");

  // Gemini APIを呼び出し（リトライ付き）
  const result = await retryWithBackoff(async () => {
    return await model.generateContent(prompt);
  }, 3, 1000);

  const response = result.response;
  const text = response.text();

  // ログ: レスポンス
  console.log("==================== Gemini API Response ====================");
  console.log(`企業名: ${companyName}`);
  console.log("--- レスポンス（JSON） ---");
  console.log(text);
  console.log("===========================================================");

  // JSONをパース
  let analysisData: CompanyAnalysis;
  try {
    analysisData = JSON.parse(text) as CompanyAnalysis;
  } catch (error) {
    throw new Error(`Failed to parse Gemini API response: ${text}`);
  }

  // メタデータを取得
  const metadata = {
    modelUsed: "gemini-2.0-flash-exp",
    tokensUsed: 0, // Gemini APIはトークン数を返さないため0に設定
    searchSources: [], // Groundingの検索ソースは後で実装
    prompt, // デバッグ用：送信したプロンプト
    rawResponse: text, // デバッグ用：生のレスポンス
  };

  return {
    analysis: analysisData,
    metadata,
  };
}
