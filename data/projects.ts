export type Project = {
  id: string; title: string; hours: number; skills: string[]; requires: string[];
  goal: string; equipment: string; brief: string; procedure: string[];
  rubric: { id: string; text: string }[];
};
export const projects: Project[] = [
  {
    id: 'project-model', title: "\\(01 \\cdot\\) 計算とコードでロボットを予測する", hours: 10,
    skills: ['m-number','m-algebra','m-calc-diff','m-calc-int','m-prob','p-kinematics','p-energy','cs-programming','cs-testing'], requires: [],
    goal: '単位付きの物理モデルを実装し、解析解・数値解・測定を比較する。',
    equipment: 'PC、表計算またはPython/Java、距離と時刻の合成CSV。実機は不要。',
    brief: "質量4 kgの台車を静止から\\(\\frac{1 m}{s^{2}}\\)で2秒加速、その後2秒等速にする。位置の理論値は2秒で2 m、4秒で6 m。速度測定へ\\(+\\frac{0.02 m}{s}\\)のバイアスを加え、積分誤差を検証する。刻み0.1秒と0.02秒を比較する。",
    procedure: ['変数、単位、座標、初期条件を1枚に定義し、位置・速度・運動エネルギーを手計算する。', '時刻・位置・速度を出す計算コードを実装し、区間の切替時刻をテストする。', 'バイアスなし・ありのログを積分する。4秒時点のバイアス由来の位置誤差0.08 mを理論と照合する。', '刻みを変えて離散化誤差とセンサの系統誤差を分け、再現手順をREADMEへ残す。'],
    rubric: [{id:'units',text:'全入出力の単位と仮定があり、2秒・4秒の解析値へ照合している。'},{id:'tests',text:'0、区間境界、負速度のテストと数値誤差の許容値がある。'},{id:'bias',text:'0.08 mのバイアス誤差を再現し、刻みを細かくしても消えない理由を説明する。'},{id:'reproduce',text:'別の人がコードとCSVから同じグラフを再生成できる。'}],
  },
  {
    id: 'project-mechanism', title: "\\(02 \\cdot\\) 製造できるIntakeを設計する", hours: 20,
    skills: ['me-fbd','me-stress','me-tolerance','me-fasteners','me-bearings','me-gears','me-belts','me-cad','me-manufacturing','me-motor-match'], requires: ['project-model'],
    goal: '荷重計算からCAD・図面・BOM・組立手順まで一貫させる。',
    equipment: 'CAD、ノギス、材料・軸受・モータのメーカー仕様。製作は設備訓練済みの監督者と実施。',
    brief: "学習用のローラ直径60 mm、幅250 mm、必要表面速度\\(\\frac{1.5 m}{s}\\)、接線負荷20 Nで設計する。要求出力は約477 rpm、トルク\\(0.6 N\\cdot m\\)。設計荷重はまず2倍で検討するが、この倍率だけで安全を保証しない。モータ仕様の負荷時動作点を使う。",
    procedure: ['FBDと荷重経路を書き、ローラ速度・トルク・軸反力・曲げを計算する。片持ちと両持ちを比較する。', '軸、軸受、伝達要素、ボルトを選び、公差と製造方法を指定する。モータの電流制限下の動作点を確認する。', 'CADで可動範囲、ベルト張力調整、工具アクセス、部品交換を検証し、図面とBOMを出す。', '印刷または加工試験片で寸法と組立性を確認する。未製作なら公差積み上げ・仮想組立を行い、未検証事項を明記する。'],
    rubric: [{id:'sizing',text:"477 rpmと\\(0.6 N\\cdot m\\)の算出過程があり、効率・始動・負荷変動も評価している。"},{id:'drawing',text:'CAD、図面、BOMの版が一致し、材料と重要公差がある。'},{id:'loads',text:'軸・支持・締結の荷重と変形を説明し、許容値の根拠がある。'},{id:'assembly',text:'組立順序、工具空間、交換時間、製作または仮想組立の結果を残している。'}],
  },
  {
    id: 'project-electrical', title: "\\(03 \\cdot\\) 配電とセンサの立ち上げ", hours: 14,
    skills: ['p-electricity','e-ohm','e-power','e-wiring','e-motorctrl','e-sensors','e-can','e-ethernet','e-noise','e-debug'], requires: ['project-model'],
    goal: '配線図から検査し、電源・CAN・センサの故障を測定で切り分ける。',
    equipment: '回路シミュレータ、機器仕様書。実習時は対応工具・テスタと監督者、電源を切った練習ハーネス。',
    brief: "モータ2系統と位置センサ、CAN機器、制御計算機の電装設計を作る。例題の電源\\(E=12.6 V\\)、内部抵抗\\(0.02 \\Omega\\)、合計60 Aでは11.4 Vとなる。これは規則値ではない。採用機器と当該シーズンの線径・保護・接地規則を別に確認する。",
    procedure: ['電源から各負荷までの系統図、線径・端子・保護・CAN ID・終端・IPの表を作る。規則と仕様書の参照を記す。', '無通電で極性、導通、圧着、固定、終端を検査する。抵抗測定を通電中に行わない。', "シミュレーション、次に可能なら監督下の低出力実習で、正指令\\(\\to\\)正位置、1回転換算、通信状態を確認する。", '断線・終端不足・接触抵抗増加を紙上またはシミュレーションで注入し、測定点と予想値を照合する。危険な短絡を実機で作らない。'],
    rubric: [{id:'diagram',text:'系統図とID表・型番・規則参照が揃い、端子と線材が適合している。'},{id:'inspection',text:'無通電検査と通電測定を分け、極性とCAN終端の根拠を説明する。'},{id:'calibration',text:'センサの原点、方向、減速比を含む単位換算を既知値で検証する。'},{id:'faults',text:'3つの故障について症状、仮説、測定、原因を記録する。'}],
  },
  {
    id: 'project-control', title: '04 · Elevatorをモデル化して制御する', hours: 20,
    skills: ['m-ode','p-forces','c-feedback','c-pid','c-feedforward','c-characterization','c-profile','c-tuning','cs-state-machine'], requires: ['project-mechanism','project-electrical'],
    goal: "\\(FF+PID\\)と軌道制約を設計し、負荷が変わっても要求を検証する。",
    equipment: 'PCと下の制御実験室、CSV解析。実機では落下防止・可動域・停止手段を監督者と確保。',
    brief: "4 kgの台車を\\(0\\to 0.6 m\\)へ移動する。学習用要求は速度\\(\\le \\frac{0.8 m}{s}\\)、加速度\\(\\le \\frac{1 m}{s^{2}}\\)、終点誤差\\(\\pm 0.02 m\\)へ3秒以内に整定、0.5秒維持。理想張力は加速時43.2 N（\\(g=9.8\\)）。実機要求はチームが再設定する。",
    procedure: ['質量、半径、減速比から必要トルクと電流を求め、可動域・電圧・電流の制限を定義する。', '台形または三角形プロファイル、原点取得、limit switch、異常停止の状態機械を実装する。', '同定用ログでFFを求め、Pから段階的に調整する。積分飽和とセンサ遅延をシミュレーションで比較する。', "荷重\\(\\frac{4}{5} kg\\)と供給\\(\\frac{12}{10} V\\)の4条件を各3回評価し、全ログ・最大誤差・整定時間・飽和を残す。要求未達は設計へ戻す。"],
    rubric: [{id:'model',text:'43.2 Nの計算と機構・電装の能力比較があり、保持と加速を分けている。'},{id:'limits',text:'速度・加速度・位置・電流の制限と無効化・原点失敗時の挙動を検証する。'},{id:'response',text:"誤差\\(\\pm 0.02 m\\)を0.5秒維持する整定判定を実装し、4条件\\(\\times 3\\)試行を報告する。"},{id:'analysis',text:"\\(\\frac{\\frac{\\frac{FF}{P}}{I}}{D}\\)各項と飽和をログで説明し、未達条件と改善を記録する。"}],
  },
  {
    id: 'project-autonomy', title: '05 · Swerve・推定・自律走行を統合する', hours: 24,
    skills: ['r-coordinates','r-kinematics','r-swerve','r-odometry','r-vision','r-localization','r-trajectory','r-planning','c-estimation','cs-realtime'], requires: ['project-control'],
    goal: '座標変換から経路追従まで、時刻と誤差を追跡する。',
    equipment: 'PC、2DシミュレータまたはWPILibのシミュレーション、合成visionログ。',
    brief: "モジュール位置\\((\\pm 0.3,\\pm 0.3) m\\)の4輪車を想定し、1 m角の経路を\\(\\frac{0.5 m}{s}\\)以下で周回する。学習用目標は終点位置誤差\\(\\le 0.10 m\\)、heading誤差\\(\\le 5^{\\circ}\\)。vision遅延100 msと2秒の欠測区間を追加する。",
    procedure: ['各モジュールの正方向、オフセット、順番を定義し、直進・横移動・純旋回を単体検証する。', 'encoderとgyroからodometryを実装し、1%スケール誤差を入れて長距離ドリフトを確認する。', '時刻付きvisionを融合する。既知位置と動的試験で取付変換と遅延を切り分ける。', '経路に車体外形と停止余裕を設定し、通常・欠測・外れ値の条件で各3回追従する。最終位置と途中の誤差を記録する。'],
    rubric: [{id:'frames',text:"field/robot/camera変換の往復と\\(\\pm \\pi\\)境界のテストがある。"},{id:'modules',text:'3種類の基本運動と車輪速度上限の共通縮小を検証する。'},{id:'fusion',text:'同じログでodometry単独と融合を比較し、遅延・外れ値・欠測を評価する。'},{id:'path',text:'終点の位置・角度の判定と途中の衝突・誤差・飽和を報告する。'}],
  },
  {
    id: 'project-ai', title: "\\(06 \\cdot\\) 現場条件で評価できる認識器", hours: 18,
    skills: ['m-prob','m-opt','ai-data','ai-ml','ai-dl','ai-rl','ai-physical','cs-testing'], requires: ['project-model'],
    goal: 'モデル精度とロボット全体の成功率を分け、未知条件と遅延を評価する。',
    equipment: 'PC、許可された物体画像または自作画像、固定した評価用データ。GPUは必須ではない。',
    brief: "対象物あり/なしを判定する簡単なモデルを作る。撮影日または環境単位でtrain/validation/testを分け、閾値はvalidationで選ぶ。テスト目標は再現率\\(\\ge 90\\%\\)、適合率\\(\\ge 90\\%\\)、推論95パーセンタイル\\(\\le 100 ms\\)とし、未達でもデータを隠さず改善計画を示す。",
    procedure: ['ラベル仕様、クラス件数、照明・背景・距離を定義する。隣接フレームの漏洩を避け、単純な基準分類器を作る。', '小さなモデルを学習し、固定した未使用テストで混同行列、条件別性能、推論遅延を測る。', '低信頼・古い結果・推論失敗時の代替動作をシミュレーションし、誤認識が機構へ与える影響を報告する。', '発展として小さな格子MDPでQ学習を実装し、報酬の抜け道を1つ示す。認識の教師あり学習との目的の違いを説明する。'],
    rubric: [{id:'split',text:'分割の単位、ラベル規則、重複確認、クラス件数が記録される。'},{id:'metrics',text:'基準モデルとの比較、混同行列、条件別性能と遅延分位点を報告する。'},{id:'fallback',text:'低信頼・欠測・遅延に対する切替とシステム成功率を検証する。'},{id:'learning',text:'モデルの勾配または損失計算と、MDP・Q更新・終端条件を説明できる。'}],
  },
  {
    id: 'project-integration', title: "\\(07 \\cdot\\) 全系統の設計レビューと故障診断", hours: 24,
    skills: ['r-requirements','r-architecture','r-integration','r-verification','me-failure','e-debug','c-tuning','cs-events','cs-git'], requires: ['project-mechanism','project-electrical','project-control','project-autonomy','project-ai'],
    goal: '機械・電装・制御・AI担当の境界を揃え、要求から試験まで追跡する。',
    equipment: '前課題のCAD・回路・コード・ログ。実機がなければ統合シミュレーションと明示した制約。',
    brief: "取込\\(\\to\\)保持\\(\\to\\)指定位置へ運搬\\(\\to\\)排出のシーケンスを作る。要求には荷重、所要時間、位置誤差、同時消費電流、通信断時動作を含める。故障はセンサ符号反転、電圧低下、機械摩擦増加、vision遅延をシミュレーションで個別に注入する。",
    procedure: ['要求IDと機械寸法・電装接続・ソフトAPIのインターフェース表を作り、必須条件と比較軸を分ける。', 'レビューで最悪荷重・同時動作・制御競合・部品交換・年度規則のチェックを行い、未解決事項に担当と期限を付ける。', '4種類の故障を別の人が注入し、原因を知らない状態で時系列ログから診断する。原因・結果・対策を分けて記録する。', '正常・復旧・再起動・無効化の統合テストを行い、変更の影響範囲へ回帰試験を実施する。'],
    rubric: [{id:'trace',text:'5件以上の要求が設計・試験・結果・証拠へ追跡できる。'},{id:'interfaces',text:'単位、正方向、時間基準、所有権、異常時の値が分野間で一致する。'},{id:'diagnosis',text:'4種類の故障で観測に基づく原因特定と復旧・回帰試験を報告する。'},{id:'review',text:'別担当のレビュー指摘と対応記録があり、未解決の必須要求を明記する。'}],
  },
  {
    id: 'project-handoff', title: "\\(08 \\cdot\\) 卒業制作の引継ぎと口頭レビュー", hours: 10,
    skills: ['r-documentation','r-verification','r-dynamics','c-state','c-cascade','c-mpc'], requires: ['project-integration'],
    goal: '成果物を他者が再現し、未知の変更要求にも根拠をもって対応する。',
    equipment: '完成したポートフォリオ、別担当またはメンター。',
    brief: "最終パッケージを初見の担当者へ渡し、原点取得・1回の正常動作・1回の故障診断を再現してもらう。追加要求「荷重1.5倍」「機構幅\\(-20\\%\\)」「観測遅延\\(+50 ms\\)」から1つを選び、影響する数式・CAD・配電・制御・試験を更新する。",
    procedure: ['README、CAD/図面/BOM、配線図、設定、コード版、試験ログ、既知の制限を同じ版でまとめる。', '口頭で荷重・電力・座標・制御・推定・AI評価から質問を受け、式と実測の根拠を説明する。', '追加要求への影響分析と再設計を行う。現代制御・動力学・MPCのうち1つを単純モデルで比較し、採否を説明する。', '引継ぎ担当が再現した手順と詰まった箇所を記録し、文書と試験を改訂する。実機未実施なら実機検証を残課題として引き継ぐ。'],
    rubric: [{id:'package',text:'別担当が口頭補足なしで成果物を開き、構成と再現手順を追える。'},{id:'defense',text:'機械・電装・制御・数学・AIの判断を根拠付きで説明し、質問と回答を記録する。'},{id:'transfer',text:'追加要求の影響を複数分野で計算し、設計と再試験を更新する。'},{id:'handoff',text:'レビュー者、再現結果、未検証事項が記録され、シミュレーションと実機を区別する。'}],
  },
];
