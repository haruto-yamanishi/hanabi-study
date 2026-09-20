import { Resource, Skill } from '@/lib/types';

const K = (courseName: string, relation: 'direct'|'partial'|'prerequisite'|'extension'|'gap' = 'direct') => ({
  school: 'kamiyama',
  schoolName: '神山まるごと高専',
  sourceYear: 2026,
  courseName,
  relation,
});

export const skills: Skill[] = [
  // Math
  {id:'m-number',domain:'math',section:'数学基礎',nameJa:'数・割合・単位',nameEn:'Numbers, Ratios & Units',description:'割合、比例、単位換算、有効数字を扱う。',prerequisites:[],importance:10,frcApplications:['ギア比','速度換算','電流・電力計算'],schoolMappings:[K('基礎数学Ⅰ')],x:0,y:0},
  {id:'m-algebra',domain:'math',section:'数学基礎',nameJa:'式変形・方程式',nameEn:'Algebra',description:'式変形、一次・二次方程式、連立方程式を扱う。',prerequisites:['m-number'],importance:10,frcApplications:['モータ計算','制御式の整理'],schoolMappings:[K('基礎数学Ⅰ')],x:0,y:130},
  {id:'m-functions',domain:'math',section:'関数',nameJa:'関数とグラフ',nameEn:'Functions & Graphs',description:'式・表・グラフを行き来して変化を読む。',prerequisites:['m-algebra'],importance:10,frcApplications:['ログ解析','センサ特性'],schoolMappings:[K('基礎数学Ⅱ')],x:0,y:260},
  {id:'m-trig',domain:'math',section:'幾何・ベクトル',nameJa:'三角比・三角関数',nameEn:'Trigonometry',description:'sin/cos/tanを幾何と周期関数の両方で扱う。',prerequisites:['m-functions'],importance:10,frcApplications:['swerve','角度','力の分解'],schoolMappings:[K('基礎数学Ⅱ'),K('代数幾何学','partial')],x:-180,y:400},
  {id:'m-vectors',domain:'math',section:'幾何・ベクトル',nameJa:'ベクトル',nameEn:'Vectors',description:'ベクトルの成分、内積、基底を扱う。',prerequisites:['m-functions'],importance:10,frcApplications:['速度ベクトル','座標変換'],schoolMappings:[K('代数幾何学')],x:0,y:400},
  {id:'m-calc-diff',domain:'math',section:'微積分',nameJa:'微分',nameEn:'Differentiation',description:'変化率、導関数、近似を理解する。',prerequisites:['m-functions','m-trig'],importance:10,frcApplications:['速度・加速度','PID D項'],schoolMappings:[K('微分積分学')],x:180,y:400},
  {id:'m-calc-int',domain:'math',section:'微積分',nameJa:'積分',nameEn:'Integration',description:'累積量、定積分、不定積分を理解する。',prerequisites:['m-calc-diff'],importance:9,frcApplications:['位置推定','PID I項'],schoolMappings:[K('微分積分学')],x:180,y:540},
  {id:'m-linear',domain:'math',section:'線形代数',nameJa:'行列・線形代数',nameEn:'Linear Algebra',description:'行列、線形写像、固有値の基礎を扱う。',prerequisites:['m-vectors'],importance:10,frcApplications:['座標変換','状態空間'],schoolMappings:[K('線形代数学'),K('代数幾何学','prerequisite')],x:-60,y:550},
  {id:'m-multicalc',domain:'math',section:'微積分',nameJa:'多変数微積分',nameEn:'Multivariable Calculus',description:'偏微分、勾配、ヤコビアンを扱う。',prerequisites:['m-calc-int','m-vectors'],importance:8,frcApplications:['運動学','最適化'],schoolMappings:[K('解析学Ⅰ')],x:120,y:690},
  {id:'m-ode',domain:'math',section:'微分方程式',nameJa:'常微分方程式',nameEn:'Ordinary Differential Equations',description:'時間変化を微分方程式でモデル化する。',prerequisites:['m-calc-int','m-linear'],importance:10,frcApplications:['機構応答','回路','制御'],schoolMappings:[K('解析学Ⅱ')],x:-20,y:700},
  {id:'m-prob',domain:'math',section:'確率・統計',nameJa:'確率・統計',nameEn:'Probability & Statistics',description:'分布、期待値、分散、推定を扱う。',prerequisites:['m-functions'],importance:8,frcApplications:['センサノイズ','実験データ'],schoolMappings:[K('確率統計学'),K('統計データ分析','partial')],x:260,y:690},
  {id:'m-opt',domain:'math',section:'最適化',nameJa:'最適化',nameEn:'Optimization',description:'目的関数、制約、勾配法の基礎を扱う。',prerequisites:['m-linear','m-multicalc'],importance:7,frcApplications:['軌道生成','パラメータ調整'],schoolMappings:[K('情報数学','partial')],x:130,y:830},

  // Physics
  {id:'p-kinematics',domain:'physics',section:'力学',nameJa:'位置・速度・加速度',nameEn:'Kinematics',description:'運動を位置・速度・加速度で記述する。',prerequisites:['m-functions','m-calc-diff'],importance:10,frcApplications:['trajectory','encoderログ'],schoolMappings:[K('物理')],x:470,y:300},
  {id:'p-forces',domain:'physics',section:'力学',nameJa:'力と運動方程式',nameEn:'Forces & Newton Laws',description:'自由物体図とF=maで運動を解析する。',prerequisites:['m-vectors','p-kinematics'],importance:10,frcApplications:['arm/elevator荷重','traction'],schoolMappings:[K('物理')],x:470,y:440},
  {id:'p-energy',domain:'physics',section:'力学',nameJa:'仕事・エネルギー・電力',nameEn:'Work, Energy & Power',description:'仕事、エネルギー、出力の関係を扱う。',prerequisites:['p-forces'],importance:9,frcApplications:['モータ選定','mechanism速度'],schoolMappings:[K('物理')],x:470,y:580},
  {id:'p-rotation',domain:'physics',section:'回転',nameJa:'回転運動・トルク',nameEn:'Rotational Dynamics',description:'角速度、トルク、慣性モーメントを扱う。',prerequisites:['p-forces','m-trig'],importance:10,frcApplications:['gearbox','arm','shooter'],schoolMappings:[K('物理')],x:470,y:720},
  {id:'p-friction',domain:'physics',section:'力学',nameJa:'摩擦・接触',nameEn:'Friction & Contact',description:'静止摩擦・動摩擦と接触力を扱う。',prerequisites:['p-forces'],importance:8,frcApplications:['wheel traction','intake'],schoolMappings:[K('物理')],x:610,y:580},
  {id:'p-electricity',domain:'physics',section:'電気',nameJa:'電気の基礎',nameEn:'Electricity Basics',description:'電圧・電流・抵抗・電力を物理量として理解する。',prerequisites:['m-algebra'],importance:10,frcApplications:['robot power','battery'],schoolMappings:[K('物理','partial'),K('電気電子工学基礎')],x:650,y:300},

  // CS
  {id:'cs-programming',domain:'cs',section:'Programming',nameJa:'プログラミング基礎',nameEn:'Programming Fundamentals',description:'変数、制御構造、関数、クラスを扱う。',prerequisites:[],importance:10,frcApplications:['robot code'],schoolMappings:[K('基礎プログラミングⅠ'),K('基礎プログラミングⅡ')],x:-500,y:0},
  {id:'cs-debug',domain:'cs',section:'Programming',nameJa:'デバッグ・ログ',nameEn:'Debugging & Logging',description:'仮説を立ててログ・再現条件から原因を切り分ける。',prerequisites:['cs-programming'],importance:10,frcApplications:['試合前トラブル対応'],schoolMappings:[K('プログラミング演習Ⅰ','partial'),K('プログラミング演習Ⅱ','partial')],x:-500,y:140},
  {id:'cs-data',domain:'cs',section:'CS基礎',nameJa:'データ構造',nameEn:'Data Structures',description:'配列、Map、Queue、Tree等を選択する。',prerequisites:['cs-programming'],importance:7,frcApplications:['state/history','path data'],schoolMappings:[K('アルゴリズム')],x:-650,y:280},
  {id:'cs-algorithms',domain:'cs',section:'CS基礎',nameJa:'アルゴリズム',nameEn:'Algorithms',description:'探索、ソート、グラフ、計算量を扱う。',prerequisites:['cs-data'],importance:8,frcApplications:['path planning'],schoolMappings:[K('アルゴリズム')],x:-500,y:280},
  {id:'cs-git',domain:'cs',section:'開発基盤',nameJa:'Git・共同開発',nameEn:'Git & Collaboration',description:'branch、commit、review、conflict解消を扱う。',prerequisites:['cs-programming'],importance:9,frcApplications:['FRC team development'],schoolMappings:[K('プログラミング演習Ⅱ','partial')],x:-350,y:280},
  {id:'cs-state-machine',domain:'cs',section:'Robot Software',nameJa:'状態機械・シーケンス',nameEn:'State Machines',description:'状態遷移とイベント駆動の設計を行う。',prerequisites:['cs-programming'],importance:10,frcApplications:['subsystem logic','auto sequence'],schoolMappings:[K('応用プログラミング','partial')],x:-500,y:420},
  {id:'cs-testing',domain:'cs',section:'開発基盤',nameJa:'テスト設計',nameEn:'Software Testing',description:'unit/integration testと再現可能な検証を設計する。',prerequisites:['cs-debug'],importance:8,frcApplications:['robot regression'],schoolMappings:[K('プログラミング演習Ⅱ','extension')],x:-350,y:420},
  {id:'cs-networks',domain:'cs',section:'Systems',nameJa:'ネットワーク基礎',nameEn:'Networking',description:'IP、Ethernet、latency、通信障害を理解する。',prerequisites:['cs-programming'],importance:8,frcApplications:['roboRIO','Limelight','radio'],schoolMappings:[K('ネットワーク・インターネット')],x:-650,y:420},
  {id:'cs-architecture',domain:'cs',section:'Systems',nameJa:'コンピュータシステム',nameEn:'Computer Architecture',description:'CPU、memory、I/O、周期処理の基礎を理解する。',prerequisites:['cs-programming'],importance:7,frcApplications:['loop timing','embedded'],schoolMappings:[K('コンピュータアーキテクチャ')],x:-650,y:560},


  {id:'cs-events',domain:'cs',section:'Robot Software',nameJa:'イベント駆動・Command設計',nameEn:'Event-driven Robot Software',description:'event、command、scheduler、subsystem ownershipを扱う。',prerequisites:['cs-state-machine','cs-testing'],importance:9,frcApplications:['WPILib command-based','autonomous sequencing'],schoolMappings:[K('応用プログラミング','extension')],x:-350,y:560},
  {id:'cs-realtime',domain:'cs',section:'Systems',nameJa:'周期処理・リアルタイム基礎',nameEn:'Timing & Real-time Basics',description:'loop period、latency、jitter、blocking処理が制御へ与える影響を扱う。',prerequisites:['cs-architecture','cs-debug'],importance:9,frcApplications:['20 ms loop','control timing','vision latency'],schoolMappings:[K('コンピュータアーキテクチャ','extension')],x:-500,y:700},

  // Electronics
  {id:'e-ohm',domain:'electronics',section:'電気基礎',nameJa:'オーム則・電力',nameEn:'Ohm Law & Power',description:'V=IRとP=VIを使って回路を見積もる。',prerequisites:['p-electricity','m-algebra'],importance:10,frcApplications:['voltage drop','current'],schoolMappings:[K('電気電子工学基礎')],x:760,y:420},
  {id:'e-power',domain:'electronics',section:'FRC電装',nameJa:'バッテリー・配電',nameEn:'Battery & Power Distribution',description:'battery、breaker、配電、brownoutを理解する。',prerequisites:['e-ohm'],importance:10,frcApplications:['FRC power system'],schoolMappings:[K('電気電子工学基礎','partial')],x:760,y:560},
  {id:'e-wiring',domain:'electronics',section:'FRC電装',nameJa:'配線・圧着・コネクタ',nameEn:'Wiring & Crimping',description:'wire gauge、端子、圧着品質、strain reliefを扱う。',prerequisites:['e-ohm'],importance:10,frcApplications:['robot wiring'],schoolMappings:[K('電気電子工学基礎','extension')],x:900,y:560},
  {id:'e-motorctrl',domain:'electronics',section:'FRC電装',nameJa:'モータコントローラ',nameEn:'Motor Controllers',description:'motor controller、PWM/CAN、current limitを扱う。',prerequisites:['e-power'],importance:10,frcApplications:['SparkMAX','TalonFX'],schoolMappings:[K('電子回路','partial')],x:760,y:700},
  {id:'e-sensors',domain:'electronics',section:'センシング',nameJa:'センサ・エンコーダ',nameEn:'Sensors & Encoders',description:'encoder、limit switch、IMU、analog/digital sensorを扱う。',prerequisites:['e-ohm'],importance:10,frcApplications:['mechanism feedback'],schoolMappings:[K('IoTシステム','partial'),K('電子回路','partial')],x:900,y:700},
  {id:'e-can',domain:'electronics',section:'通信',nameJa:'CAN bus',nameEn:'CAN Bus',description:'bus topology、termination、ID、障害切り分けを扱う。',prerequisites:['e-motorctrl','cs-networks'],importance:10,frcApplications:['FRC CAN'],schoolMappings:[K('IoTシステム','extension'),K('ネットワーク・インターネット','extension')],x:830,y:840},
  {id:'e-ethernet',domain:'electronics',section:'通信',nameJa:'Ethernet・Robot Network',nameEn:'Robot Networking',description:'radio、switch、roboRIO、vision deviceのネットワークを扱う。',prerequisites:['cs-networks'],importance:8,frcApplications:['FRC robot network'],schoolMappings:[K('ネットワーク・インターネット')],x:980,y:840},
  {id:'e-noise',domain:'electronics',section:'センシング',nameJa:'ノイズ・接地',nameEn:'Noise & Grounding',description:'noise source、ground、signal integrityの基礎を扱う。',prerequisites:['e-sensors','e-wiring'],importance:7,frcApplications:['sensor glitches'],schoolMappings:[K('電子回路','extension')],x:900,y:980},
  {id:'e-debug',domain:'electronics',section:'FRC電装',nameJa:'電装デバッグ',nameEn:'Electrical Debugging',description:'multimeter、ログ、症状から電装故障を切り分ける。',prerequisites:['e-power','e-wiring','e-sensors'],importance:10,frcApplications:['pit debugging'],schoolMappings:[K('電気電子工学基礎','extension')],x:760,y:980},

  // Mechanical
  {id:'me-fbd',domain:'mechanical',section:'機械基礎',nameJa:'自由物体図・荷重経路',nameEn:'FBD & Load Paths',description:'荷重を図示し、どこに力が流れるかを読む。',prerequisites:['p-forces'],importance:10,frcApplications:['mechanism design'],schoolMappings:[K('物理','extension')],x:460,y:900},
  {id:'me-stress',domain:'mechanical',section:'機械基礎',nameJa:'応力・変形',nameEn:'Stress & Deformation',description:'応力、ひずみ、曲げの基礎を扱う。',prerequisites:['me-fbd'],importance:8,frcApplications:['shaft/frame strength'],schoolMappings:[K('物理','extension')],x:460,y:1040},
  {id:'me-tolerance',domain:'mechanical',section:'設計・製造',nameJa:'寸法・公差・はめあい',nameEn:'Tolerance & Fits',description:'製造誤差、クリアランス、はめあいを設計する。',prerequisites:['m-number'],importance:9,frcApplications:['bearing fit','shaft fit'],schoolMappings:[K('3DCG＆CADデザイン','partial')],x:620,y:900},
  {id:'me-fasteners',domain:'mechanical',section:'設計・製造',nameJa:'締結・ねじ',nameEn:'Fasteners',description:'bolt、nut、thread、緩み対策を扱う。',prerequisites:['me-fbd'],importance:9,frcApplications:['robot assembly'],schoolMappings:[K('デザインエンジニアリング演習','extension')],x:620,y:1040},
  {id:'me-bearings',domain:'mechanical',section:'伝達要素',nameJa:'軸・ベアリング',nameEn:'Shafts & Bearings',description:'shaft support、bearing配置、拘束を設計する。',prerequisites:['me-tolerance','me-fbd'],importance:10,frcApplications:['gearbox','rollers'],schoolMappings:[K('3DCG＆CADデザイン','extension')],x:540,y:1180},
  {id:'me-gears',domain:'mechanical',section:'伝達要素',nameJa:'ギア・減速比',nameEn:'Gears & Ratios',description:'gear ratio、torque、speedの関係を扱う。',prerequisites:['p-rotation','m-number'],importance:10,frcApplications:['gearbox'],schoolMappings:[K('物理','extension')],x:700,y:1180},
  {id:'me-belts',domain:'mechanical',section:'伝達要素',nameJa:'ベルト・チェーン',nameEn:'Belts & Chain',description:'pitch、tension、中心距離、伝達比を扱う。',prerequisites:['me-gears'],importance:9,frcApplications:['elevator','intake'],schoolMappings:[K('デザインエンジニアリング演習','extension')],x:700,y:1320},
  {id:'me-cad',domain:'mechanical',section:'CAD',nameJa:'CAD・アセンブリ',nameEn:'CAD & Assemblies',description:'拘束、assembly、干渉確認、図面化を行う。',prerequisites:['me-tolerance'],importance:10,frcApplications:['robot CAD'],schoolMappings:[K('3DCG＆CADデザイン')],x:540,y:1320},
  {id:'me-manufacturing',domain:'mechanical',section:'設計・製造',nameJa:'加工法・DFM',nameEn:'Manufacturing & DFM',description:'CNC、laser、3D print等に合わせて設計する。',prerequisites:['me-cad'],importance:9,frcApplications:['fabrication'],schoolMappings:[K('デザインエンジニアリング演習','partial')],x:540,y:1460},
  {id:'me-motor-match',domain:'mechanical',section:'機構設計',nameJa:'モータ・機構マッチング',nameEn:'Motor Mechanism Matching',description:'要求速度・トルクからmotor/ratioを選ぶ。',prerequisites:['me-gears','p-energy','e-motorctrl'],importance:10,frcApplications:['arm','elevator','shooter'],schoolMappings:[K('デザインエンジニアリング実践','extension')],x:700,y:1460},
  {id:'me-failure',domain:'mechanical',section:'機構設計',nameJa:'故障モード・設計レビュー',nameEn:'Failure Modes & Design Review',description:'壊れ方を予測し、検証と改善を行う。',prerequisites:['me-bearings','me-fasteners','me-manufacturing'],importance:9,frcApplications:['design review'],schoolMappings:[K('デザインエンジニアリング実践','partial')],x:620,y:1600},

  // Control
  {id:'c-feedback',domain:'control',section:'制御基礎',nameJa:'フィードバック',nameEn:'Feedback Control',description:'open/closed loop、誤差、安定化の考え方を理解する。',prerequisites:['m-functions','p-kinematics','e-sensors'],importance:10,frcApplications:['mechanism control'],schoolMappings:[K('人工知能','gap')],x:220,y:980},
  {id:'c-pid',domain:'control',section:'制御基礎',nameJa:'PID制御',nameEn:'PID Control',description:'P/I/D各項を挙動から調整する。',prerequisites:['c-feedback','m-calc-diff','m-calc-int'],importance:10,frcApplications:['elevator','arm','drive'],schoolMappings:[K('人工知能','gap')],x:220,y:1120},
  {id:'c-feedforward',domain:'control',section:'制御基礎',nameJa:'Feedforward',nameEn:'Feedforward',description:'モデルから必要入力を先回りして与える。',prerequisites:['p-energy','c-feedback'],importance:10,frcApplications:['kS/kV/kA','gravity compensation'],schoolMappings:[K('物理','extension')],x:360,y:1120},
  {id:'c-characterization',domain:'control',section:'実験・同定',nameJa:'システム同定・Characterization',nameEn:'System Identification',description:'ログからモデル係数や応答特性を推定する。',prerequisites:['m-prob','c-feedforward','cs-debug'],importance:9,frcApplications:['SysId'],schoolMappings:[K('統計データ分析','extension')],x:360,y:1260},
  {id:'c-profile',domain:'control',section:'モーション制御',nameJa:'Motion Profile',nameEn:'Motion Profiling',description:'速度・加速度制約付き目標生成を扱う。',prerequisites:['p-kinematics','c-pid'],importance:9,frcApplications:['trapezoid profile'],schoolMappings:[K('解析学Ⅰ','extension')],x:220,y:1260},
  {id:'c-state',domain:'control',section:'現代制御',nameJa:'状態空間',nameEn:'State Space',description:'状態方程式、可制御性、状態feedbackを扱う。',prerequisites:['m-linear','m-ode','c-feedback'],importance:8,frcApplications:['advanced control'],schoolMappings:[K('線形代数学','extension'),K('解析学Ⅱ','extension')],x:220,y:1400},
  {id:'c-estimation',domain:'control',section:'現代制御',nameJa:'状態推定・Kalman',nameEn:'State Estimation',description:'観測、ノイズ、Kalman filterの考え方を扱う。',prerequisites:['m-prob','c-state'],importance:8,frcApplications:['sensor fusion'],schoolMappings:[K('確率統計学','extension')],x:360,y:1400},


  {id:'c-cascade',domain:'control',section:'モーション制御',nameJa:'カスケード制御・ループ設計',nameEn:'Cascaded Control',description:'位置・速度など複数loopの帯域と役割を分けて設計する。',prerequisites:['c-pid','c-profile','cs-realtime'],importance:8,frcApplications:['arm/elevator velocity+position loops'],schoolMappings:[K('解析学Ⅱ','extension')],x:360,y:1400},
  {id:'c-tuning',domain:'control',section:'実験・同定',nameJa:'ログベース制御調整',nameEn:'Data-driven Controller Tuning',description:'ログと実験からgain、feedforward、制約を調整する。',prerequisites:['c-characterization','c-pid','c-feedforward'],importance:10,frcApplications:['SysId','PID tuning','mechanism characterization'],schoolMappings:[K('統計データ分析','extension')],x:500,y:1260},
  {id:'c-mpc',domain:'control',section:'現代制御',nameJa:'MPCの直感',nameEn:'Model Predictive Control Intuition',description:'モデル・制約・有限ホライズン最適化で制御入力を選ぶ考え方を扱う。',prerequisites:['c-state','m-opt'],importance:5,frcApplications:['advanced motion control'],schoolMappings:[K('情報数学','extension')],x:500,y:1540},

  // Robotics
  {id:'r-coordinates',domain:'robotics',section:'Geometry',nameJa:'座標系・回転',nameEn:'Coordinate Frames',description:'frame、rotation、transformを扱う。',prerequisites:['m-trig','m-vectors','m-linear'],importance:10,frcApplications:['field/robot/camera frames'],schoolMappings:[K('代数幾何学','extension')],x:-80,y:980},
  {id:'r-kinematics',domain:'robotics',section:'Geometry',nameJa:'順・逆運動学',nameEn:'Kinematics',description:'関節・wheel状態とrobot motionを変換する。',prerequisites:['r-coordinates','m-multicalc'],importance:9,frcApplications:['swerve','arm'],schoolMappings:[K('線形代数学','extension')],x:-80,y:1120},
  {id:'r-odometry',domain:'robotics',section:'Localization',nameJa:'Odometry',nameEn:'Odometry',description:'encoder/gyroからpose変化を積算する。',prerequisites:['r-coordinates','p-kinematics','e-sensors'],importance:10,frcApplications:['swerve odometry'],schoolMappings:[K('IoTシステム','extension')],x:-220,y:1260},
  {id:'r-vision',domain:'robotics',section:'Perception',nameJa:'Vision・AprilTag',nameEn:'Robot Vision',description:'camera geometry、tag pose、latencyを扱う。',prerequisites:['r-coordinates','cs-networks'],importance:9,frcApplications:['Limelight','PhotonVision'],schoolMappings:[K('人工知能','partial')],x:-360,y:1260},
  {id:'r-localization',domain:'robotics',section:'Localization',nameJa:'Localization・Sensor Fusion',nameEn:'Localization',description:'odometryとvisionを融合してposeを推定する。',prerequisites:['r-odometry','r-vision','c-estimation'],importance:10,frcApplications:['pose estimator'],schoolMappings:[K('人工知能','extension')],x:-220,y:1400},
  {id:'r-swerve',domain:'robotics',section:'FRC Drive',nameJa:'Swerve Kinematics',nameEn:'Swerve Kinematics',description:'chassis speedとmodule stateの変換を理解する。',prerequisites:['r-kinematics','m-trig'],importance:10,frcApplications:['swerve drive'],schoolMappings:[K('線形代数学','extension')],x:-80,y:1400},
  {id:'r-trajectory',domain:'robotics',section:'Autonomy',nameJa:'軌道生成・追従',nameEn:'Trajectory & Path Following',description:'trajectory生成とfeedback/feedforward追従を扱う。',prerequisites:['c-profile','r-localization','c-feedforward'],importance:10,frcApplications:['autonomous'],schoolMappings:[K('アルゴリズム','extension')],x:-160,y:1540},
  {id:'r-architecture',domain:'robotics',section:'Integration',nameJa:'Robot Software Architecture',nameEn:'Robot Architecture',description:'subsystem、command、interface、責務分離を設計する。',prerequisites:['cs-state-machine','cs-git'],importance:10,frcApplications:['WPILib command-based'],schoolMappings:[K('応用プログラミング','extension')],x:-400,y:1400},
  {id:'r-integration',domain:'robotics',section:'Integration',nameJa:'統合テスト・Root Cause',nameEn:'Integration & Root Cause',description:'機械・電装・softwareを横断して不具合を切り分ける。',prerequisites:['r-architecture','e-debug','me-failure','cs-testing'],importance:10,frcApplications:['pit/system integration'],schoolMappings:[K('デザインエンジニアリング実践','partial')],x:-400,y:1540},
  {id:'r-planning',domain:'robotics',section:'Autonomy',nameJa:'Motion Planning',nameEn:'Motion Planning',description:'探索、collision、制約付きplanningを扱う。',prerequisites:['cs-algorithms','m-opt','r-trajectory'],importance:7,frcApplications:['advanced autonomy'],schoolMappings:[K('アルゴリズム','extension')],x:-160,y:1680},


  {id:'r-requirements',domain:'robotics',section:'Systems Engineering',nameJa:'要求・インターフェース・Trade Study',nameEn:'Requirements & Trade Studies',description:'要求、制約、interface、比較軸を明文化して設計判断を行う。',prerequisites:['r-architecture','me-failure','e-debug'],importance:10,frcApplications:['design review','subsystem interfaces','mechanism selection'],schoolMappings:[K('デザインエンジニアリング演習','partial')],x:-540,y:1680},
  {id:'r-verification',domain:'robotics',section:'Systems Engineering',nameJa:'検証・リスク・Design Review',nameEn:'Verification & Risk',description:'要求から検証項目を作り、risk、failure mode、reviewを回す。',prerequisites:['r-requirements','r-integration','cs-testing'],importance:10,frcApplications:['verification plan','pre-match checklist','design review'],schoolMappings:[K('デザインエンジニアリング実践','partial')],x:-400,y:1820},
  {id:'r-documentation',domain:'robotics',section:'Systems Engineering',nameJa:'技術文書・Cross-discipline Communication',nameEn:'Engineering Documentation',description:'配線図、CAD、control spec、test resultを他分野が読める形で残す。',prerequisites:['r-requirements','cs-git'],importance:8,frcApplications:['handoff','pit documentation','code/CAD review'],schoolMappings:[K('デザインエンジニアリング実践','partial')],x:-260,y:1820},
  {id:'r-dynamics',domain:'robotics',section:'Advanced Robotics',nameJa:'ロボット動力学',nameEn:'Robot Dynamics',description:'質量・慣性・コリオリ・重力項を含む運動方程式の直感を扱う。',prerequisites:['r-kinematics','p-rotation','m-multicalc'],importance:6,frcApplications:['advanced arm control','model-based control'],schoolMappings:[K('解析学Ⅱ','extension')],x:0,y:1820},

  // AI
  {id:'ai-data',domain:'ai',section:'ML基礎',nameJa:'データ・評価',nameEn:'Data & Evaluation',description:'train/test、metric、leakage、biasを扱う。',prerequisites:['m-prob','cs-programming'],importance:8,frcApplications:['vision dataset'],schoolMappings:[K('統計データ分析'),K('人工知能','prerequisite')],x:920,y:1120},
  {id:'ai-ml',domain:'ai',section:'ML基礎',nameJa:'機械学習基礎',nameEn:'Machine Learning',description:'loss、generalization、basic modelsを理解する。',prerequisites:['ai-data','m-linear'],importance:8,frcApplications:['classification/regression'],schoolMappings:[K('人工知能')],x:920,y:1260},
  {id:'ai-dl',domain:'ai',section:'Deep Learning',nameJa:'Deep Learning',nameEn:'Deep Learning',description:'neural network、backprop、optimizationを扱う。',prerequisites:['ai-ml','m-multicalc'],importance:7,frcApplications:['vision'],schoolMappings:[K('人工知能')],x:920,y:1400},
  {id:'ai-rl',domain:'ai',section:'Robot Learning',nameJa:'強化学習',nameEn:'Reinforcement Learning',description:'MDP、value、policy、explorationを扱う。',prerequisites:['ai-ml','m-opt'],importance:6,frcApplications:['robot learning'],schoolMappings:[K('人工知能','extension')],x:920,y:1540},
  {id:'ai-physical',domain:'ai',section:'Robot Learning',nameJa:'Physical AI / Robot Learning',nameEn:'Physical AI',description:'知覚・制御・学習を実世界ロボットで統合する。',prerequisites:['ai-dl','ai-rl','r-localization','c-state'],importance:6,frcApplications:['learned robotics'],schoolMappings:[K('人工知能','extension')],x:760,y:1680},
];

export const resources: Resource[] = [
  {id:'res-frc-rules',title:'FRC Season Materials・規則と更新',provider:'FIRST',url:'https://www.firstinspires.org/resources/library/frc/season-materials',skills:['e-power','e-wiring','me-failure','r-requirements','r-verification'],format:'公式規則',note:'当該シーズンのマニュアル・更新・Q&Aを確認する。教材の例題値は規則値ではない。'},
  {id:'res-wpilib-can',title:'CAN Wiring Basics',provider:'WPILib',url:'https://docs.wpilib.org/en/stable/docs/hardware/hardware-basics/can-wiring-basics.html',skills:['e-can','e-debug'],format:'公式ドキュメント',note:'終端と配線。内蔵終端は使用機器の資料も照合する。2026-09-20参照。'},
  {id:'res-wpilib-ff',title:'Feedforward Control',provider:'WPILib',url:'https://docs.wpilib.org/en/stable/docs/software/advanced-controls/controllers/feedforward.html',skills:['c-feedforward','c-characterization','c-tuning'],format:'公式ドキュメント',note:'モデルと係数の単位。採用バージョンのAPIを確認する。2026-09-20参照。'},
  {id:'res-wpilib-pid',title:'Introduction to PID',provider:'WPILib',url:'https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/introduction-to-pid.html',skills:['c-feedback','c-pid'],format:'公式解説',note:'PIDとfeedforwardの役割を深掘りする。2026-09-20参照。'},
  {id:'res-wpilib-command',title:'What Is Command-Based Programming?',provider:'WPILib',url:'https://docs.wpilib.org/en/stable/docs/software/commandbased/what-is-command-based.html',skills:['cs-events','r-architecture','cs-state-machine'],format:'公式ドキュメント',note:'commandとsubsystemの責務。採用言語・バージョンで実装を確認する。'},
  {id:'res-wpilib-pose',title:'PoseEstimator API',provider:'WPILib',url:'https://github.wpilib.org/allwpilib/docs/release/java/edu/wpi/first/math/estimator/PoseEstimator.html',skills:['r-localization','r-vision','r-odometry'],format:'公式API資料',note:'観測時刻と遅延補償を確認する。2026-09-20参照。'},
  {id:'res-modern-robotics',title:'Modern Robotics — Jacobians',provider:'Northwestern University',url:'https://modernrobotics.northwestern.edu/chapters/chapter5/',skills:['r-kinematics','r-dynamics','m-multicalc'],format:'講義動画・教科書',note:'関節速度と手先速度・力の関係を深掘りする。'},
  {id:'res-ml-course',title:'Machine Learning Crash Course',provider:'Google',url:'https://developers.google.com/machine-learning/crash-course',skills:['ai-data','ai-ml','ai-dl'],format:'講座・演習',note:'回帰・分類・データ評価の補助教材。'},
  {id:'res-rl-course',title:'Statistical Reinforcement Learning',provider:'University of Washington',url:'https://courses.cs.washington.edu/courses/cse542/26sp/',skills:['ai-rl','ai-physical'],format:'講義資料',note:'MDP、Bellman方程式、Q学習を深掘りする。'},
  {id:'res-calc-a',title:'微分積分学 A',provider:'京都大学OCW',url:'https://ocw.kyoto-u.ac.jp/course/547/',skills:['m-calc-diff','m-calc-int'],format:'講義ノート',note:'微積分を大学レベルで深掘りする補助資料。'},
  {id:'res-linear',title:'線型代数学 A',provider:'京都大学OCW',url:'https://ocw.kyoto-u.ac.jp/course/730/',skills:['m-linear'],format:'講義動画',note:'線形代数の理論を深掘り。'},
  {id:'res-circuits',title:'電気電子回路演習',provider:'京都大学OCW',url:'https://ocw.kyoto-u.ac.jp/course/3/',skills:['e-ohm','e-noise'],format:'動画 + 資料',note:'回路の補助教材。'},
  {id:'res-robot',title:'ロボット工学（講義資料）',provider:'東京電機大学 井上研究室',url:'https://www.rm.dendai.ac.jp/inouelab/inoue/class/robot/robot.html',skills:['r-coordinates','r-kinematics','c-state'],format:'講義資料',note:'運動学・制御の深掘り。'},
  {id:'res-dl',title:'Deep Learning基礎講座 2023',provider:'東京大学 松尾研究室 / Deep Learning JP',url:'https://deeplearning.jp/lectures/dlb2023/',skills:['ai-ml','ai-dl'],format:'公開講座',note:'AI領域の補助教材。'},
];

export const domainNames = {
  math: 'Math', physics: 'Physics', cs: 'CS', electronics: 'Electronics',
  mechanical: 'Mechanical', control: 'Control', robotics: 'Robotics', ai: 'AI',
} as const;

export const roadmapStages = [
  {id:'foundation',title:'Foundation',subtitle:'数学・物理・Programming',sections:['数学基礎','関数','幾何・ベクトル','Programming','力学','回転','電気','電気基礎']},
  {id:'engineering',title:'Engineering Core',subtitle:'機械・電装・CSの土台',sections:['微積分','線形代数','微分方程式','確率・統計','CAD','FRC電装','機械基礎','設計・製造','CS基礎','開発基盤','Systems']},
  {id:'frc',title:'FRC Core',subtitle:'ロボットを成立させる',sections:['伝達要素','機構設計','センシング','通信','制御基礎','Robot Software','Integration','Systems Engineering']},
  {id:'robotics',title:'Robotics',subtitle:'自律・推定・モーション',sections:['Geometry','Localization','FRC Drive','Autonomy','モーション制御','実験・同定']},
  {id:'advanced',title:'Advanced',subtitle:'現代制御・AI・Physical AI',sections:['現代制御','Advanced Robotics','Perception','最適化','ML基礎','Deep Learning','Robot Learning']},
] as const;

export const kamiyamaSource = {
  year: 2026,
  curriculumUrl: 'https://kamiyama.ac.jp/guidance/curriculum/',
  syllabusUrl: 'https://kamiyama.ac.jp/guidance/syllabus/',
  verifiedAt: '2026-09-19',
};
