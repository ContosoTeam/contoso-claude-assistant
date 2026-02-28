![メインブランチ CI](https://img.shields.io/badge/%E3%83%A1%E3%82%A4%E3%83%B3%E3%83%96%E3%83%A9%E3%83%B3%E3%83%81_CI-passing-brightgreen)
![CodeQL セキュリティ分析](https://img.shields.io/badge/CodeQL_%E3%82%BB%E3%82%AD%E3%83%A5%E3%83%AA%E3%83%86%E3%82%A3%E5%88%86%E6%9E%90-passing-brightgreen)
![OpenSSF Scorecard](https://img.shields.io/badge/openssf_scorecard-7.2-brightgreen)
![OpenSSF Best Practices](https://img.shields.io/badge/openssf_best_practices-silver-silver)
![ライセンス](https://img.shields.io/badge/%E3%83%A9%E3%82%A4%E3%82%BB%E3%83%B3%E3%82%B9-MIT-green)
![Node.js](https://img.shields.io/badge/Node.js-20-339933)
![Express](https://img.shields.io/badge/Express-4.18-000000)

# Contoso Claude アシスタント

Azure Claude（Azure 上の Anthropic）を活用した、企業向けナレッジマネジメント用内部 Q&A アシスタントです。

## 機能

- Claude 3 Sonnet による自然言語 Q&A
- ドキュメントのアップロードとインデックス作成
- MongoDB による会話履歴管理
- JWT ベースの認証
- レポート用テンプレートレンダリング

## セットアップ

```bash
npm install
npm start
```

## API エンドポイント

- `POST /api/chat` - アシスタントとチャット
- `POST /api/upload` - ドキュメントをアップロード
- `GET /api/conversations` - 会話一覧を取得
- `POST /api/token` - 認証トークンを取得

## 技術スタック

- Node.js / Express
- MongoDB
- Azure Claude (Anthropic)
- EJS テンプレートエンジン

## ライセンス

このプロジェクトは [MIT ライセンス](LICENSE)の下で公開されています。

## セキュリティ

脆弱性を発見された場合は、[セキュリティポリシー](SECURITY.md)をご確認ください。
