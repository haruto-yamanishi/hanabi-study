# Hanabi Study

FRC Team 9494 Hanabi向けのEngineering learning platform。

## 教材拡充

Hanabi Studyは教材リンク集ではなく、FRCで使える知識を「学ぶ → 思い出す → 解く → 時間を空けて再確認 → 実機へ転用する」ための学習システムです。

- 169教材（78本の基礎＋78本の応用＋13本の短編入門）、438問、156実習、8つの統合制作
- PID / 重力FF / 遅延 / 飽和を比較できる制御実験室とCSV出力
- 実践ノート・制作ルーブリック・レビュー記録（ローカル保存とJSON export/import）
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

`npm run content:audit` で参照整合性・前提の循環・全スキルの教材構成・実習・制作課題を監査します。

| Domain | 基幹教材・実習 | 教材構成の充足率 |
| --- | ---: | ---: |
| Math | 12 | 100% |
| Physics | 6 | 100% |
| CS | 11 | 100% |
| Electronics | 9 | 100% |
| Mechanical | 11 | 100% |
| Control | 10 | 100% |
| Robotics | 14 | 100% |
| AI | 5 | 100% |

充足率はConcept / Example / Recall / Practice / Checkpoint / Transfer / Review variant / FRC application / 必要分野のDebug・Designの**収録状況**です。内容の深さ、学習者の実力、実機技能の認定を意味しません。基礎・応用教材の読解・演習の目安は約105時間、制作課題は約140時間。スキル実習・反復・実機作業は別途必要です。

## 学び方と制作

1. 「学ぶ」で基幹教材を選び、前提教材から原理・例題・自分の説明・数値演習を進める。
2. 実習で成果物と期待値・実測値を残す。実践ノートは下書きでも保存できる。
3. Checkpointと時間を空けたReviewで定着を確認する。
4. 「制作・修了」で計算モデル → Intake設計 / 電装 → Elevator制御 → 自律走行 / AI → 統合診断 → 引継ぎに取り組む。
5. 156本の基礎・応用教材のCheckpoint 80%以上、全スキルの定着、156実習、8制作のレビュー記録を揃えて最終レビューへ進む。

制作のチェックとレビュー者の記入は自己申告で、本人認証・自動採点・資格認定ではありません。実機での製作・圧着・制御調整・故障診断は監督者が別途確認します。シミュレーションによる提出も認めますが、実機技能の証明とは分けます。

制御実験室は単純なエレベータモデルです。電気・熱特性などを省いており、実機ゲインの自動設計には使いません。実機規則や許容線径・保護定格は、当該シーズンのFIRST資料と機器メーカーの資料を確認します。

## Content maintenance

- `data/units/`: 8分野の手書き本文・計算2条件・判断問題・実習仕様。
- `data/engineering.ts`: 同じ内容からLessonと復習可能なAssessmentを構成。IDは安定させる。
- `data/projects.ts`: 8制作課題の条件、作業手順、提出ルーブリック。
- `scripts/content-audit.mjs`: 全スキルの不足をエラーにし、参照・回答・依存を検査。
- `scripts/learning-check.mjs`: 制御モデルの制約、提出条件、保存、旧形式import、復習variantを検証。

旧Lesson / AssessmentのIDとlocalStorageキーは維持しています。JSONは新しい`practicalSubmissions`も含み、旧exportでは空の実践ノートとして読み込みます。

## Kamiyama mapping

神山mappingは2026年度の学校公式情報をsource of truthとして、Skill単位で `direct / partial / prerequisite / extension / gap` を保持します。学校で履修したこととHanabi StudyでMasterしたことは別扱いです。

- https://kamiyama.ac.jp/guidance/curriculum/
- https://kamiyama.ac.jp/guidance/syllabus/

## Development

```bash
npm install
npm run typecheck
npm run content:audit
npm run learning:check
npm run build
npm run dev
```

学習データは現在localStorageに保存します。SettingsからJSON export / importできます。

### 想起・説明の反復

「反復」に156題の説明カードを追加。解説を隠して回答し、誤答の修正点を記録して解き直します。自己評価は習得点に加算せず、時間を空けた再確認に使います。教材の段階フィルタから基礎／応用を選べます。

参考記事、独自の復習間隔、教材数の数え方は[学習メソッドの設計](docs/learning-method.md)を参照してください。

### 基礎課程・100,000問のドリル・戻り先診断

「基礎・ドリル」に100単元を追加。中学数学から力学・工学へつなぎ、**200問題型×条件違い500問＝100,000問**を収録します（練習80,000問、初見確認20,000問）。既存教材や再回答をこの件数へ重複加算していません。

分からない問題から前提を短く診断し、必要なら正負の数・分数まで戻れます。基礎ドリルの後に中断した問題へ復帰でき、戻り先も保存されます。問題数は習得保証ではありません。

[学習導線・対象範囲・保存仕様](docs/foundations-and-recovery.md) ／ [収録内容と前提関係の一覧](docs/problem-bank-manifest.json)

検証：`npm run bank:audit`（10万問全件監査）、`npm run bank:check`（解答・反復・診断）。収録内容変更時は`npm run bank:manifest`で内訳を更新します。

## 現在地テストから始める

「テスト」で分野・単元を選び、できる範囲を先に確認できます。基礎100単元は各4問、FRC・工学78スキルは異なる4問・2能力で合格し、ノードが埋まります。後の誤答で該当範囲の達成度が下がり、再テストで回復します。時間を空けた定着確認と実践課題は別に残します。[判定・保存の仕様](docs/placement-tests.md)。検証は `npm run placement:check`。

数式はLaTeX（KaTeX）に対応しています。[教材への数式の書き方](docs/math-notation.md)。構文検証は `npm run math:check`。
