# Hanabi Study

FRC Team 9494 Hanabi向けのEngineering learning platform。

## v0.2

Hanabi Studyは教材リンク集ではなく、FRCで使える知識を「学ぶ → 思い出す → 解く → 時間を空けて再確認 → 実機へ転用する」ための学習システムです。

- 78 Skillの依存グラフ（Math / Physics / CS / Electronics / Mechanical / Control / Robotics / AI）
- アプリ内Lesson Player: Concept → Example → Recall → Practice → Checkpoint
- Adaptive baseline / 「わからない」 / numeric + MCQ / Transfer・Debug・Design competency
- Spaced repetition: 6h → 1d → 3d → 7d → 14d → 30d → 60d を初期ポリシーに、結果で間隔を伸縮
- 8分野レーダーチャートと分野詳細
- 接続型Roadmap / Skill dependency map
- Stopwatch / optional Pomodoro / Skill別学習時間
- 神山まるごと高専 2026年度カリキュラムmapping
- Lesson / Step / Exercise / CheckpointのGood・Bad・Comment feedback
- Curriculum coverage / Assessment quality dashboard
- JSON export / import

## Target

全履修者が専門領域を持ちながら、機械・電装・制御・software・system integrationを横断して技術会話、設計、実装、デバッグに参加できる状態を目指します。

到達像は [`docs/graduate-profile.md`](docs/graduate-profile.md) に定義しています。

## Current content coverage

`npm run content:audit` で機械的に監査します。v0.2初期値は以下です。教材不足を隠さず、Missing contentをQuality画面から改善していく前提です。

| Domain | Coverage | Basic complete | Full complete |
| --- | ---: | ---: | ---: |
| Math | 43% | 4 / 12 | 0 / 12 |
| Physics | 39% | 1 / 6 | 0 / 6 |
| CS | 15% | 0 / 11 | 0 / 11 |
| Electronics | 30% | 2 / 9 | 0 / 9 |
| Mechanical | 20% | 1 / 11 | 0 / 11 |
| Control | 26% | 2 / 10 | 0 / 10 |
| Robotics | 27% | 3 / 14 | 0 / 14 |
| AI | 26% | 0 / 5 | 0 / 5 |

Basic = Concept + Example + Recall + Practice + Checkpoint。FullはさらにTransfer / spaced-review variant / FRC application / 必要分野のDebug・Designまで要求します。

## Kamiyama mapping

神山mappingは2026年度の学校公式情報をsource of truthとして、Skill単位で `direct / partial / prerequisite / extension / gap` を保持します。学校で履修したこととHanabi StudyでMasterしたことは別扱いです。

- https://kamiyama.ac.jp/guidance/curriculum/
- https://kamiyama.ac.jp/guidance/syllabus/

## Development

```bash
npm install
npm run typecheck
npm run content:audit
npm run build
npm run dev
```

学習データは現在localStorageに保存します。SettingsからJSON export / importできます。
