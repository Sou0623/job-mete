/**
 * Firebase Functions エントリーポイント
 * Job Mete プロジェクト
 */

import {setGlobalOptions} from "firebase-functions/v2";

// グローバルオプション設定
setGlobalOptions({
  region: "asia-northeast1",
  maxInstances: 10,
});

// 企業管理Functions
export {createCompany} from "./handlers/companies/createCompany";
export {reanalyzeCompany} from "./handlers/companies/reanalyzeCompany";

// 予定管理Functions
export {createEvent} from "./handlers/events/createEvent";

// 傾向分析Functions
export {analyzeTrends} from "./handlers/trends/analyzeTrends";
