// .envファイルから環境変数（APIキーやDB IDなど）を読み込む
require('dotenv').config();

// HTTPリクエストを送るためのaxiosライブラリを読み込み
const axios = require('axios');

// Notion APIの公式クライアントライブラリを読み込み
const { Client } = require('@notionhq/client');

// Notionクライアントの初期化（認証には環境変数のAPIキーを使用）
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// テストモード判定（環境変数 TEST_MODE が "true" の場合に有効）
const isTestMode = process.env.TEST_MODE === 'true';

/**
 * 🔹 OpenAI APIを用いてテキストを要約する関数
 * @param {string} text - 要約したい本文
 * @returns {string} 要約結果（もしくはテストモード時のダミー要約）
 */
async function summarizeText(text) {
  // テストモードではAPIを呼び出さずにダミー要約を返す
  if (isTestMode) {
    console.log('※ TEST_MODE: OpenAI APIは呼び出されません');
    return "（テスト要約）" + text;
  }

  // 実際にOpenAIへリクエストを送信
  console.log('Sending request to OpenAI API...');
  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo", // モデル名（今後変更の可能性あり）
      messages: [{ role: "user", content: `次の内容を要約してください:\n${text}` }],
    },
    {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
    }
  );

  // レスポンスから要約結果を抽出して返す
  const summary = res.data.choices[0].message.content;
  console.log('Received response from OpenAI API: ', summary);
  return summary;
}

/**
 * 🔹 Notionのデータベースに要約結果を記録する関数
 * @param {string} summary - 要約された内容
 * @param {string} fullText - 元の詳細テキスト
 * @param {string} category - 分類（例: "学習", "日報" など）
 */
async function addToNotion(summary, fullText, category) {
  await notion.pages.create({
    parent: { database_id: process.env.NOTION_DB_ID },
    properties: {
      Name: { title: [{ text: { content: new Date().toLocaleString() } }] }, // 現在時刻をタイトルに
      分類: { multi_select: [{ name: category }] }, // 分類をmulti_selectとして登録
      要約: { rich_text: [{ text: { content: summary } }] }, // 要約テキスト
      詳細: { rich_text: [{ text: { content: fullText } }] }, // 元のテキスト
    },
  });
}

/**
 * 🔹 同じ内容が既にNotionに登録されているかをチェックする関数
 * @param {string} fullText - 確認対象のテキスト
 * @returns {boolean} 重複していればtrue、未登録であればfalse
 */
async function checkIfAIreadySummarized(fullText) {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DB_ID,
    filter: {
      property: "詳細",
      rich_text: {
        equals: fullText,
      },
    },
  });

  return response.results.length > 0;
}

// 他のファイル（例: Discord Bot）から呼び出せるようにエクスポート
module.exports = {
  summarizeText,
  addToNotion,
  checkIfAIreadySummarized,
};

/**
 * 🔸 [将来用] テスト・単体動作確認用のメイン関数（通常は使用しない）
 * 以下を直接実行すれば、単体でOpenAIとNotionの動作確認ができます。
 *
 * async function main() {
 *   const inputText = isTestMode
 *     ? "（テスト）これはNode.jsの非同期処理を学んだテスト記録です。"
 *     : "Node.jsの基礎を学んだ。モジュールの読み込みや非同期処理の基礎を理解した。";
 *
 *   const alreadySummarized = await checkIfAIreadySummarized(inputText);
 *   if (alreadySummarized) {
 *     console.log('この内容はすでに登録されています。');
 *     return;
 *   }
 *
 *   const summary = await summarizeText(inputText);
 *   await addToNotion(summary, inputText, "学習");
 *   console.log("Notionに登録完了！要約:", summary);
 * }
 *
 * // メイン関数を呼び出して実行（テスト時に使用）
 * main();
 */
