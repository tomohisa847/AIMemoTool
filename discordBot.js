// Discord.js ライブラリの読み込みと必要な Intent（Botが受信するイベントの種類）を指定
const { Client, GatewayIntentBits } = require('discord.js');

// Notion 連携関連の関数を外部ファイル（notionHelper.js）から読み込む
const { summarizeText, addToNotion, checkIfAIreadySummarized } = require('./notionHelper');

// 環境変数を読み込む（.envファイルから）
require('dotenv').config();

// Discord クライアントを作成し、メッセージ受信やコンテンツ取得のためのIntentを設定
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,           // ギルド（サーバー）関連イベントを受け取る
    GatewayIntentBits.GuildMessages,   // メッセージ受信イベントを受け取る
    GatewayIntentBits.MessageContent,  // メッセージの内容（テキスト）を取得するために必要
  ],
});

// Botがログインして準備完了したときに一度だけ実行される
client.once('ready', () => {
  console.log(`✅ Bot is ready as ${client.user.tag}`); // コンソールにBotのユーザー名を表示
});

// メッセージを受け取ったときの処理
client.on('messageCreate', async message => {
  // Bot自身のメッセージには反応しない
  if (message.author.bot) return;

  // メッセージ本文を取得し、改行で行に分割
  const content = message.content.trim();
  const lines = content.split('\n');

  // 入力から「分類」と「やったこと」を抽出するための変数
  let category = null;
  let detail = null;

  // 各行を調べて「分類: 〇〇」「やったこと: 〇〇」の形式を取得
  for (const line of lines) {
    if (line.startsWith('分類:')) {
      category = line.replace('分類:', '').trim(); // カテゴリ名を取得
    } else if (line.startsWith('やったこと:')) {
      detail = line.replace('やったこと:', '').trim(); // やった内容を取得
    }
  }

  // どちらかが入力されていない場合、エラーとしてユーザーに返信
  if (!category || !detail) {
    message.reply('❌ 入力形式が正しくありません。\n例:\n分類: 学習\nやったこと: Node.jsの非同期処理を学んだ');
    return;
  }

  try {
    // すでに同じ内容がNotionに記録されていないかを確認
    const alreadySummarized = await checkIfAIreadySummarized(detail);
    if (alreadySummarized) {
      console.log('この内容はすでに登録されています。'); // 重複記録防止
      return;
    }

    // OpenAI APIを使ってやったことを要約
    const summary = await summarizeText(detail);

    // Notionに要約・詳細・分類を記録
    await addToNotion(summary, detail, category);

    // ユーザーに成功メッセージを返信
    message.reply(`✅ Notionに登録しました！\n📝 要約: ${summary}`);
  } catch (err) {
    // エラー発生時はコンソールに出力し、ユーザーにも通知
    console.error(err);
    message.reply('⚠️ 登録中にエラーが発生しました。コンソールを確認してください。');
  }
});

// Discord Botにログイン（トークンは環境変数から取得）
client.login(process.env.DISCORD_BOT_TOKEN);
