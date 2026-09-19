# Hanabi Study

FRC Team 9494 Hanabi向けの学習ダッシュボード。

数学・物理・CS・電子・機械・制御・ロボティクス・AIのスキルマップ、教材、ベースラインテスト、学習記録、ステータス、ロードマップを1つにまとめています。

## Features

- 教材一覧と検索
- 16問のベースラインテスト
- 分野別ステータス
- AI支援あり / 自力のスコア分離
- 前提スキルに基づくロードマップ
- Skill Map
- 学習時間からToday sessionを生成
- 学習記録（Evidence）
- JSON export / import
- local-first保存

## Development

```bash
npm install
npm run dev
```

`http://localhost:3000` を開いてください。

## Build

```bash
npm run build
npm start
```

## Data

初期スキル、教材、診断問題は `data/curriculum.ts` にあります。

進捗はブラウザのlocalStorageに保存されます。設定画面からJSONでexport / importできます。
