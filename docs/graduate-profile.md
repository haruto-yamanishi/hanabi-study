# Hanabi Study Graduate Profile

Hanabi Studyを全履修したメンバーは、専門領域を持ちつつ、FRCロボットを**機械・電装・ソフトウェア・制御のシステム**として理解し、設計レビュー・実装・検証・デバッグへ参加できる状態を目標とする。

## 全員が持つ共通知識

- Math / Physics: 代数、三角関数、ベクトル、微積分、線形代数、微分方程式、確率統計、力学、回転、電気
- Mechanical: FBD、load path、応力、公差、fastener、bearing、gear/belt/chain、motor matching、CAD、DFM、failure mode
- Electronics: V/I/R/P、battery/power distribution、wire/crimp/connector、motor controller、sensor、CAN、Ethernet、noise、計測と切り分け
- Software / CS: programming、data structure、algorithm、Git、logging、testing、state machine、event-driven design、network、timing
- Control: feedback、PID、feedforward、characterization、motion profile、cascade loop、state space、estimation、data-driven tuning
- Robotics: coordinate frame、kinematics、odometry、vision、localization、swerve、trajectory、architecture、integration、planning
- Systems Engineering: requirement、interface、trade study、risk、verification、design review、documentation、cross-discipline communication

## 修了の意味

教材を読了しただけでは修了としない。Skillごとに、必要に応じて以下を要求する。

1. Recall — 見ずに思い出せる
2. Explain — 自分の言葉で説明できる
3. Reproduce / Calculate — ゼロから解ける・作れる
4. Transfer — 条件が変わっても適用できる
5. Debug / Design — 実機の症状から切り分け、要求から設計判断できる
6. Retention — 時間を空けても再現できる

最終的な基準は「Hanabi内で知っている」ではなく、世界トップ層のFRCチームの技術会話・レビュー・デバッグへ入っても基礎部分で会話が止まらないこと。


## アプリで確認する4つの条件

| 項目 | 記録上の条件 | 実際の確認 |
| --- | --- | --- |
| 基幹教材 | 基礎・応用全156本のCheckpointが80%以上、または対応スキルの現在地テスト合格 | 手順と単位を説明する |
| 定着 | 全78スキルがスコア82以上・定着点35以上（現在地テストだけでは満たさない） | 時間を空け、解答を見ずに別条件を解く |
| スキル実習 | 156件の成果物・検証ノート | 式、コード、図面、測定を再現する |
| 統合制作 | 8件のルーブリックとレビュー記録 | 別担当が設計・診断・引継ぎをレビューする |

チェックとレビュー名は自己申告で、アプリによる本人確認や認定ではない。上記が揃った表示は「最終レビューの準備ができた」という意味。オンライン教材の全クリだけで実機作業を保証しない。

## 統合制作で残すもの

1. 物理・数値計算モデル：解析解、CSV、テスト、誤差の説明。
2. Intake：荷重計算、モータ動作点、CAD、図面、BOM、公差、組立手順。
3. 電装：配線図、保護・線径の根拠、ID表、無通電検査、センサ校正、故障切り分け。
4. Elevator：FF+PID、プロファイル、状態機械、4条件×3試行のログと合否。
5. 自律走行：座標・swerve・odometry・vision融合・欠測・遅延・追従誤差。
6. AI：データ分割、基準モデル、混同行列、遅延、代替動作、MDPとQ学習。
7. 統合診断：要求と試験の対応、分野間インターフェース、4種類の模擬故障、回帰試験。
8. 引継ぎ：別担当による再現、口頭レビュー、変更要求への再設計、既知の制限。

課題の具体的な設計条件とルーブリックは `data/projects.ts` とアプリの「制作・修了」を正とする。課題に示した負荷・誤差・時間は学習用の要求で、FRC公式のルールや機器定格ではない。

## 実機での確認

シミュレーションを終えた後、チームの監督者と製作、圧着・固定、極性確認、原点取得、低出力の方向確認、制御調整、停止・復旧を実施する。通電中の抵抗測定や、危険な故障を実機へ意図的に作る試験は行わない。実機未実施の項目は未検証として引き継ぐ。

専門性の深掘りには、基幹教材に付けた一次資料と追加の設計・実験を使う。教材構成100%は、大学教育や研究分野の全範囲を収録したという意味ではない。
