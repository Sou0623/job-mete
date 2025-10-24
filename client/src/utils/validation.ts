/**
 * 入力バリデーションとサニタイゼーション
 *
 * XSS攻撃、SQLインジェクション、プロンプトインジェクションなどを防ぐための
 * バリデーションとサニタイゼーション関数群
 */

/**
 * 文字列の長さ制限
 */
export const INPUT_LIMITS = {
  COMPANY_NAME: 100,
  EVENT_TITLE: 100,
  MEMO: 1000,
  LOCATION: 200,
  SEARCH_QUERY: 100,
  EMAIL: 254, // RFC 5321 standard
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
} as const;

/**
 * 危険な文字パターン
 * プロンプトインジェクション、XSS攻撃などに使われる可能性のある文字
 */
const DANGEROUS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/is, // <script>タグ
  /<iframe[^>]*>.*?<\/iframe>/is, // <iframe>タグ
  /javascript:/i, // javascript:プロトコル
  /on\w+\s*=/i, // onload=, onclick= などのイベントハンドラ
  /<img[^>]*src[^>]*onerror[^>]*>/i, // onerrorを含むimgタグ
  /eval\s*\(/i, // eval関数
  /expression\s*\(/i, // CSS expression
  /import\s+/i, // importステートメント（プロンプトインジェクション対策）
  /<!--.*?-->/s, // HTMLコメント
] as const;

/**
 * プロンプトインジェクション用のパターン
 * AIへの指示を含む可能性のある文字列パターン
 */
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(previous|above|all)\s+(instructions|prompts?|commands?)/i,
  /disregard\s+(previous|above|all)\s+(instructions|prompts?|commands?)/i,
  /forget\s+(previous|above|all)\s+(instructions|prompts?|commands?)/i,
  /system\s*:/i,
  /assistant\s*:/i,
  /user\s*:/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<\|.*?\|>/,
] as const;

/**
 * 文字列の長さをバリデーション
 *
 * @param value - チェックする文字列
 * @param maxLength - 最大文字数
 * @param minLength - 最小文字数（オプション）
 * @returns バリデーション結果
 */
export function validateLength(
  value: string,
  maxLength: number,
  minLength: number = 0
): { valid: boolean; error?: string } {
  const length = value.trim().length;

  if (length < minLength) {
    return {
      valid: false,
      error: `${minLength}文字以上で入力してください`,
    };
  }

  if (length > maxLength) {
    return {
      valid: false,
      error: `${maxLength}文字以内で入力してください`,
    };
  }

  return { valid: true };
}

/**
 * 危険な文字列パターンを検出
 *
 * @param value - チェックする文字列
 * @returns 危険なパターンが含まれている場合はtrue
 */
export function containsDangerousPattern(value: string): boolean {
  return DANGEROUS_PATTERNS.some((pattern) => pattern.test(value));
}

/**
 * プロンプトインジェクションの可能性を検出
 *
 * @param value - チェックする文字列
 * @returns プロンプトインジェクションの可能性がある場合はtrue
 */
export function containsPromptInjection(value: string): boolean {
  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(value));
}

/**
 * 文字列をサニタイズ（危険な文字を除去）
 *
 * @param value - サニタイズする文字列
 * @returns サニタイズされた文字列
 */
export function sanitizeInput(value: string): string {
  let sanitized = value;

  // scriptタグとその中身を完全に削除
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // HTMLタグを除去（<>で囲まれた部分を削除）
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // 制御文字を除去
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

  // 連続する空白を1つに
  sanitized = sanitized.replace(/\s+/g, ' ');

  // 前後の空白を除去
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * 企業名のバリデーション
 *
 * @param companyName - 企業名
 * @returns バリデーション結果
 */
export function validateCompanyName(companyName: string): {
  valid: boolean;
  error?: string;
  sanitized?: string;
} {
  // 空文字チェック
  if (!companyName || companyName.trim().length === 0) {
    return { valid: false, error: '企業名を入力してください' };
  }

  // 長さチェック
  const lengthValidation = validateLength(
    companyName,
    INPUT_LIMITS.COMPANY_NAME,
    1
  );
  if (!lengthValidation.valid) {
    return lengthValidation;
  }

  // 危険なパターンチェック
  if (containsDangerousPattern(companyName)) {
    return {
      valid: false,
      error: '使用できない文字が含まれています',
    };
  }

  // プロンプトインジェクションチェック
  if (containsPromptInjection(companyName)) {
    return {
      valid: false,
      error: '使用できない文字列パターンが含まれています',
    };
  }

  // サニタイズ
  const sanitized = sanitizeInput(companyName);

  return { valid: true, sanitized };
}

/**
 * イベントタイトルのバリデーション
 *
 * @param title - イベントタイトル
 * @returns バリデーション結果
 */
export function validateEventTitle(title: string): {
  valid: boolean;
  error?: string;
  sanitized?: string;
} {
  // 空文字チェック
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'タイトルを入力してください' };
  }

  // 長さチェック
  const lengthValidation = validateLength(title, INPUT_LIMITS.EVENT_TITLE, 1);
  if (!lengthValidation.valid) {
    return lengthValidation;
  }

  // 危険なパターンチェック
  if (containsDangerousPattern(title)) {
    return {
      valid: false,
      error: '使用できない文字が含まれています',
    };
  }

  // サニタイズ
  const sanitized = sanitizeInput(title);

  return { valid: true, sanitized };
}

/**
 * メモのバリデーション
 *
 * @param memo - メモ
 * @returns バリデーション結果
 */
export function validateMemo(memo: string): {
  valid: boolean;
  error?: string;
  sanitized?: string;
} {
  // 空文字は許可
  if (!memo || memo.trim().length === 0) {
    return { valid: true, sanitized: '' };
  }

  // 長さチェック
  const lengthValidation = validateLength(memo, INPUT_LIMITS.MEMO);
  if (!lengthValidation.valid) {
    return lengthValidation;
  }

  // 危険なパターンチェック
  if (containsDangerousPattern(memo)) {
    return {
      valid: false,
      error: '使用できない文字が含まれています',
    };
  }

  // プロンプトインジェクションチェック（メモは特に重要）
  if (containsPromptInjection(memo)) {
    return {
      valid: false,
      error: '使用できない文字列パターンが含まれています',
    };
  }

  // サニタイズ
  const sanitized = sanitizeInput(memo);

  return { valid: true, sanitized };
}

/**
 * メールアドレスのバリデーション
 *
 * @param email - メールアドレス
 * @returns バリデーション結果
 */
export function validateEmail(email: string): {
  valid: boolean;
  error?: string;
} {
  // 空文字チェック
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'メールアドレスを入力してください' };
  }

  // 長さチェック
  const lengthValidation = validateLength(email, INPUT_LIMITS.EMAIL, 3);
  if (!lengthValidation.valid) {
    return lengthValidation;
  }

  // メールアドレス形式チェック
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: '正しいメールアドレスの形式で入力してください',
    };
  }

  return { valid: true };
}

/**
 * パスワードのバリデーション
 *
 * @param password - パスワード
 * @returns バリデーション結果
 */
export function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  // 空文字チェック
  if (!password || password.length === 0) {
    return { valid: false, error: 'パスワードを入力してください' };
  }

  // 長さチェック
  if (password.length < INPUT_LIMITS.PASSWORD_MIN) {
    return {
      valid: false,
      error: `パスワードは${INPUT_LIMITS.PASSWORD_MIN}文字以上で入力してください`,
    };
  }

  if (password.length > INPUT_LIMITS.PASSWORD_MAX) {
    return {
      valid: false,
      error: `パスワードは${INPUT_LIMITS.PASSWORD_MAX}文字以内で入力してください`,
    };
  }

  // パスワード強度チェック（英数字を含む）
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return {
      valid: false,
      error: 'パスワードは英字と数字を両方含める必要があります',
    };
  }

  return { valid: true };
}
