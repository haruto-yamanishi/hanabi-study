import { deepAssessments } from './deep';
import { engineeringAssessments } from './engineering';
import { AssessmentItem } from '@/lib/types';

export const assessments: AssessmentItem[] = [
  ...engineeringAssessments,
  ...deepAssessments,
  // Math
  {id:'a-algebra-1',skillId:'m-algebra',variantGroup:'vg-algebra-linear',competency:'calculate',format:'mcq',difficulty:1,prompt:"\\(2(x - 3) = 14\\) を満たす x は？",options:['4','7','10','17'],answer:2,explanation:"\\(2x-6=14 \\to  2x=20 \\to  x=10\\)。",revision:1},
  {id:'a-functions-1',skillId:'m-functions',competency:'explain',format:'mcq',difficulty:2,prompt:"\\(y=f(x)\\) のグラフで傾きが大きい区間が示すことは？",options:['出力が入力に対して速く変化する','出力が必ず大きい','入力が0である','関数が定義されない'],answer:0,explanation:'傾きは入力に対する出力の変化率。',revision:1},
  {id:'a-trig-1',skillId:'m-trig',competency:'recall',format:'mcq',difficulty:1,prompt:"単位円上の点 \\((\\cos \\theta , \\sin \\theta )\\) で \\(\\cos \\theta\\) が表すものは？",options:['x座標','y座標','半径','弧長'],answer:0,explanation:"\\(\\cos \\theta\\)はx座標。",revision:1},
  {id:'a-vector-1',skillId:'m-vectors',competency:'calculate',format:'numeric',difficulty:2,prompt:"\\(a=(1,2), b=(3,4)\\) の内積 \\(a\\cdot b\\) を入力してください。",answer:'11',tolerance:0,explanation:"\\(1\\times 3+2\\times 4=11\\)。",revision:1},
  {id:'a-diff-1',skillId:'m-calc-diff',competency:'calculate',format:'mcq',difficulty:2,prompt:"\\(f(x)=x^{2}\\) の導関数は？",options:['x','2x',"\\(\\frac{x^{2}}{2}\\)",'2'],answer:1,explanation:'べき乗則より2x。',revision:1},
  {id:'a-int-1',skillId:'m-calc-int',competency:'explain',format:'mcq',difficulty:2,prompt:"速度 \\(v(t)\\) を時間で積分すると何が得られる？",options:['加速度','位置の変化量','力','電力'],answer:1,explanation:'速度の時間積分は変位。',frcContext:'odometry',revision:1},
  {id:'a-linear-1',skillId:'m-linear',competency:'recall',format:'mcq',difficulty:3,prompt:'回転行列Rの列ベクトルが互いに直交することを表す式は？',options:["\\(R^\\mathsf{T}R=I\\)","\\(R+R=I\\)","\\(R^{2}=0\\)","\\(\\det (R)=0\\)"],answer:0,explanation:"正規直交行列では\\(R^\\mathsf{T}R=I\\)。",revision:1},
  {id:'a-prob-1',skillId:'m-prob',competency:'calculate',format:'mcq',difficulty:2,prompt:"独立な事象A,Bについて \\(P(A\\cap B)\\) は？",options:["\\(P(A)+P(B)\\)","\\(P(A)P(B)\\)","\\(\\frac{P(A)}{P}(B)\\)","\\(1-P(A)\\)"],answer:1,explanation:'独立なら積。',revision:1},

  // Physics
  {id:'a-kin-1',skillId:'p-kinematics',competency:'calculate',format:'numeric',difficulty:1,prompt:"静止から\\(\\frac{2 m}{s^{2}}\\)で3秒加速したときの速度\\([\\frac{m}{s}]\\)は？",answer:'6',tolerance:.01,explanation:"\\(v=at=\\frac{6 m}{s}\\)。",revision:1},
  {id:'a-force-1',skillId:'p-forces',competency:'calculate',format:'numeric',difficulty:1,prompt:"2 kgの物体に6 Nの合力。加速度\\([\\frac{m}{s^{2}}]\\)は？",answer:'3',tolerance:.01,explanation:"\\(a=\\frac{F}{m}=3\\)。",revision:1},
  {id:'a-energy-1',skillId:'p-energy',competency:'calculate',format:'mcq',difficulty:2,prompt:'200 Wの機構が2秒動作したとき、理想的に消費するエネルギーは？',options:['100 J','200 J','400 J','800 J'],answer:2,explanation:"\\(E=Pt=400 J\\)。",revision:1},
  {id:'a-rotation-1',skillId:'p-rotation',competency:'calculate',format:'numeric',difficulty:2,prompt:"半径0.25 mの腕の先に40 N。軸まわりのトルク\\([N\\cdot m]\\)は？",answer:'10',tolerance:.01,explanation:"\\(\\tau =rF=10 N\\cdot m\\)。",frcContext:'arm',revision:1},
  {id:'a-friction-1',skillId:'p-friction',competency:'transfer',format:'mcq',difficulty:3,prompt:'同じrobot massでwheelの最大tractionを増やす方法として最も直接的なのは？',options:['摩擦係数を高くする','encoder CPRを増やす','CAN IDを変える','PID I項を増やす'],answer:0,explanation:"最大静止摩擦は概ね\\(\\mu N\\)。",frcContext:'drivetrain',revision:1},

  // Electronics
  {id:'a-ohm-1',skillId:'e-ohm',competency:'calculate',format:'numeric',difficulty:1,prompt:"10 Vを\\(5 \\Omega\\)にかけた電流[A]は？",answer:'2',tolerance:.01,explanation:"\\(I=\\frac{V}{R}=2 A\\)。",revision:1},
  {id:'a-power-1',skillId:'e-power',competency:'debug',format:'mcq',difficulty:3,prompt:'高負荷時だけroboRIOがresetする。最初に優先して確認するものは？',options:['battery voltageと電源接続','robot name','encoder offset','PathPlanner GUI'],answer:0,explanation:'brownoutや接触抵抗をまず疑う。',frcContext:'brownout',revision:1},
  {id:'a-wiring-1',skillId:'e-wiring',competency:'debug',format:'mcq',difficulty:2,prompt:'圧着端子を軽く引いたら抜ける。最も適切な対応は？',options:['テープで固定','正しい端子/工具/線径で再圧着','current limitを上げる','CAN IDを変える'],answer:1,explanation:'圧着不良は再施工する。',revision:1},
  {id:'a-sensor-1',skillId:'e-sensors',competency:'explain',format:'mcq',difficulty:2,prompt:'absolute encoderの利点として最も近いものは？',options:['起動直後から絶対角度を得られる','電流を増幅する','通信遅延を0にする','motor torqueを増やす'],answer:0,explanation:'基準位置を保持できる。',revision:1},
  {id:'a-can-1',skillId:'e-can',variantGroup:'vg-can-debug',competency:'debug',format:'mcq',difficulty:4,prompt:'CAN busの一部device以降がまとめてoffline。最初に有力な確認点は？',options:['その付近のCAN配線/connector断線','robotの質量','gyro yaw','gear ratio'],answer:0,explanation:'daisy-chain途中の物理断線は下流deviceをまとめて落とす。',frcContext:'CAN debugging',revision:1},
  {id:'a-edebug-1',skillId:'e-debug',competency:'design',format:'mcq',difficulty:4,prompt:'「時々motorが止まる」を切り分ける最初の方針として良いものは？',options:['softwareを書き直す','症状の再現条件を固定し、電圧/CAN/status/logを同時に取る','motorを全部交換','PIDを上げる'],answer:1,explanation:'再現条件と観測量を揃えて仮説を潰す。',revision:1},

  // Mechanical
  {id:'a-fbd-1',skillId:'me-fbd',competency:'explain',format:'mcq',difficulty:2,prompt:'自由物体図の目的は？',options:['対象物に働く外力を分離して整理する','CADを自動生成する','CAN trafficを減らす','コードを高速化する'],answer:0,explanation:'対象を切り出して外力を明確にする。',revision:1},
  {id:'a-gear-1',skillId:'me-gears',variantGroup:'vg-gear-ratio',competency:'calculate',format:'numeric',difficulty:2,prompt:'12T gearが60T gearを駆動。理想減速比(出力/入力のトルク倍率)は？',answer:'5',tolerance:.01,explanation:"\\(\\frac{60}{12}=5\\)。",frcContext:'gearbox',revision:1},
  {id:'a-bearing-1',skillId:'me-bearings',competency:'design',format:'mcq',difficulty:3,prompt:'片持ちローラの軸曲げを減らすために、荷重点を変えず支持を見直すなら？',options:['支持点を荷重点へ近づけて片持ち長さを減らす','支持点を必ず遠ざける','支持位置は曲げに影響しない','encoder CPRを増やす'],answer:0,explanation:"片持ち部の曲げモーメントは\\(F\\times\\)距離。支持間隔の効果は荷重点と支持条件で変わり、広げれば常に良いわけではない。",revision:2},
  {id:'a-tolerance-1',skillId:'me-tolerance',competency:'transfer',format:'mcq',difficulty:3,prompt:'3D printed holeにbearingが毎回きつすぎる。設計改善として適切なのは？',options:['CAD nominal値だけを信じる','printer/materialの実測に基づきclearanceを設ける','motor currentを下げる','CAN terminationを追加'],answer:1,explanation:'製造プロセスの誤差を見込んだ公差設計が必要。',revision:1},
  {id:'a-motor-match-1',skillId:'me-motor-match',competency:'design',format:'mcq',difficulty:4,prompt:'armが必要速度には達するがstall近くで発熱が大きい。最初の設計判断として妥当なのは？',options:['減速比と必要torque/currentを再計算する','encoderを外す','software loopを削除','boltを長くする'],answer:0,explanation:'要求torqueとmotor operating pointを見直す。',frcContext:'arm design',revision:1},

  // CS
  {id:'a-prog-1',skillId:'cs-programming',competency:'reproduce',format:'mcq',difficulty:1,prompt:'同じ処理を複数箇所で使うとき、まず検討するものは？',options:['関数化','copy-pasteを増やす','global variableを増やす','コメントを消す'],answer:0,explanation:'再利用可能な処理は関数等へ分離する。',revision:1},
  {id:'a-debug-1',skillId:'cs-debug',competency:'debug',format:'mcq',difficulty:3,prompt:'bugが「試合fieldだけ」で起こる。最初に有効な行動は？',options:['fieldとpracticeの差分条件を列挙してログを比較','全部rewrite','random delayを入れる','warningを消す'],answer:0,explanation:'条件差分を観測して原因候補を絞る。',revision:1},
  {id:'a-state-machine-1',skillId:'cs-state-machine',competency:'design',format:'mcq',difficulty:3,prompt:"Intakeの「待機\\(\\to\\)取り込み\\(\\to\\)保持\\(\\to\\)排出」を実装する構造として適切なのは？",options:['状態機械','巨大な1行式','毎loopでrandom選択','CAN IDだけで制御'],answer:0,explanation:'明確な状態と遷移条件に分ける。',revision:1},
  {id:'a-network-1',skillId:'cs-networks',competency:'debug',format:'mcq',difficulty:3,prompt:'Vision cameraへpingは通るが映像だけ遅延が大きい。次に見るものは？',options:['帯域・stream設定・packet loss','gear backlash','battery重量','bolt pitch'],answer:0,explanation:'接続可否と帯域/遅延問題は分けて調べる。',revision:1},

  // Control
  {id:'a-feedback-1',skillId:'c-feedback',competency:'explain',format:'mcq',difficulty:2,prompt:'closed-loop controlの特徴は？',options:['出力を測って入力を調整する','sensorを使わない','目標値を持たない','必ず不安定になる'],answer:0,explanation:'feedbackで誤差を補正する。',revision:1},
  {id:'a-pid-1',skillId:'c-pid',competency:'recall',format:'mcq',difficulty:2,prompt:'PIDのI項が主に減らすものは？',options:['定常偏差','sensor resolution','CAN utilization','gear backlash'],answer:0,explanation:'積分項は持続誤差を蓄積する。',revision:1},
  {id:'a-pid-debug-1',skillId:'c-pid',variantGroup:'vg-pid-debug',competency:'debug',format:'mcq',difficulty:4,prompt:'位置制御が目標付近で高速に振動する。Pを上げ続けるより先に考えることは？',options:['gain過大・D/機械backlash・loop timingを確認','CAN IDを全部同じにする','encoderを無視','batteryを外す'],answer:0,explanation:'振動はgain、遅れ、機械系を含めて見る。',frcContext:'elevator tuning',revision:1},
  {id:'a-ff-1',skillId:'c-feedforward',competency:'explain',format:'mcq',difficulty:3,prompt:'Feedforwardの役割として最も近いものは？',options:['モデルから必要入力を先回りして与える','誤差を積分だけする','sensor値を暗号化する','gear ratioを自動変更'],answer:0,explanation:'目標運動に必要な入力を予測して与える。',revision:1},
  {id:'a-profile-1',skillId:'c-profile',competency:'design',format:'mcq',difficulty:3,prompt:'位置目標を瞬時にstep入力する代わりにmotion profileを使う理由は？',options:['速度/加速度制約を守り機構への要求を現実的にする','CAN IDを減らす','battery電圧を一定にする','encoderを不要にする'],answer:0,explanation:'物理制約を守った目標軌道を作る。',revision:1},

  // Robotics
  {id:'a-coord-1',skillId:'r-coordinates',competency:'calculate',format:'mcq',difficulty:2,prompt:"2Dでベクトル\\((1,0)\\)を\\(+90^{\\circ}\\)回転すると？",options:["\\((0,1)\\)","\\((0,-1)\\)","\\((1,1)\\)","\\((-1,0)\\)"],answer:0,explanation:"\\(+90^{\\circ}\\)でx軸はy軸へ。",revision:1},
  {id:'a-kinematics-1',skillId:'r-kinematics',competency:'recall',format:'mcq',difficulty:2,prompt:'順運動学が求める方向は？',options:['関節/ wheel状態→robot/手先運動',"手先姿勢\\(\\to\\)関節角だけ",'画像→class',"電圧\\(\\to\\)電流だけ"],answer:0,explanation:'内部状態から外部motionを求める。',revision:1},
  {id:'a-odometry-1',skillId:'r-odometry',competency:'explain',format:'mcq',difficulty:3,prompt:'Odometryが時間とともにずれる主因として正しいものは？',options:['小さな測定誤差を積算するため','poseを毎回GPSで確定するため','CANが必ず切れるため','gear比が常に変わるため'],answer:0,explanation:'相対測定の積算でdriftする。',revision:1},
  {id:'a-vision-1',skillId:'r-vision',variantGroup:'vg-vision-dynamic',competency:'debug',format:'mcq',difficulty:4,prompt:'AprilTag poseが旋回中だけ大きくずれる。まず疑う候補は？',options:['camera latency/時刻同期/transform','gear tooth countだけ','battery connector色','PID I項だけ'],answer:0,explanation:'動的誤差はlatencyやtimestamp、transformの影響が大きい。',revision:1},
  {id:'a-localization-1',skillId:'r-localization',competency:'transfer',format:'mcq',difficulty:4,prompt:'Vision measurementをpose estimatorへ入れる前に特に重要なのは？',options:['measurement timestampと信頼度','robotのpaint色','button mapping','bolt length'],answer:0,explanation:'時刻とmeasurement uncertaintyがfusionに重要。',revision:1},
  {id:'a-swerve-1',skillId:'r-swerve',competency:'explain',format:'mcq',difficulty:3,prompt:'field-relative driveでgyro headingを使う理由は？',options:['field座標のcommandをrobot座標へ変換するため','wheel径を変えるため','battery voltageを測るため','CAN terminationのため'],answer:0,explanation:'座標系変換にheadingが必要。',revision:1},
  {id:'a-integration-1',skillId:'r-integration',competency:'debug',format:'mcq',difficulty:5,prompt:'Elevatorが遅い、motor currentが高い、battery voltageも大きく落ちる。最初の横断的切り分けとして最も良いものは？',options:['mechanical binding/ratio/loadと電源dropをログ・実測で切り分ける','PIDだけ最大にする','softwareを全削除','encoderを外す'],answer:0,explanation:'機械負荷と電源系を同時に観測し、原因を分離する。',frcContext:'capstone',revision:1},

  // AI
  {id:'a-ai-data-1',skillId:'ai-data',competency:'explain',format:'mcq',difficulty:2,prompt:'test dataをtraining中のparameter調整に何度も使う問題は？',options:['評価が楽観的になる','motor torqueが下がる','network latencyが0になる','CAD公差が変わる'],answer:0,explanation:'test setへの過適合が起きる。',revision:1},
  {id:'a-ml-1',skillId:'ai-ml',competency:'recall',format:'mcq',difficulty:2,prompt:'training errorは低いが未知データで悪い状態は？',options:['過学習','量子化','integral windup','brownout'],answer:0,explanation:'overfitting。',revision:1},
  {id:'a-rl-1',skillId:'ai-rl',competency:'recall',format:'mcq',difficulty:3,prompt:"\\(Q(s,a)\\) が表すものとして最も近いものは？",options:['状態sで行動aを取ったときの期待累積報酬','sensor voltage','class label','learning rate'],answer:0,explanation:'state-action value。',revision:1},
  // Review variants — same structure, different surface conditions.
  {id:'a-algebra-2',skillId:'m-algebra',variantGroup:'vg-algebra-linear',competency:'calculate',format:'numeric',difficulty:1,prompt:"\\(5(x + 2) = 35\\) を満たす x は？",answer:'5',tolerance:0,explanation:"\\(x+2=7 \\to  x=5\\)。",revision:1},
  {id:'a-gear-2',skillId:'me-gears',variantGroup:'vg-gear-ratio',competency:'calculate',format:'numeric',difficulty:2,prompt:'18T gearが72T gearを駆動。理想減速比(出力/入力torque倍率)は？',answer:'4',tolerance:.01,explanation:"\\(\\frac{72}{18}=4\\)。",frcContext:'gearbox review',revision:1},
  {id:'a-can-2',skillId:'e-can',variantGroup:'vg-can-debug',competency:'debug',format:'mcq',difficulty:4,prompt:'CAN deviceが断続的に全体offlineになり、robotを揺らすと復帰する。最初に見るべきものは？',options:['CAN connector/端子の接触と物理配線','swerve gear ratio','PID D項','camera exposure'],answer:0,explanation:'振動依存なら物理接触・圧着・connectorを優先して疑う。',frcContext:'CAN review',revision:1},
  {id:'a-pid-debug-2',skillId:'c-pid',variantGroup:'vg-pid-debug',competency:'debug',format:'mcq',difficulty:4,prompt:'Elevatorが目標に近づくとゆっくり行き過ぎて戻る動きを繰り返す。まず比較したいログは？',options:['setpoint / measurement / output / velocity と loop timing','CAN ID一覧だけ','batteryの製造年だけ','robot名'],answer:0,explanation:'誤差・速度・出力・timingを同じ時間軸で見てovershootの原因を切り分ける。',frcContext:'PID retention',revision:1},
  {id:'a-vision-2',skillId:'r-vision',variantGroup:'vg-vision-dynamic',competency:'debug',format:'mcq',difficulty:4,prompt:'静止中はAprilTag poseが良いが高速並進時だけ後ろに遅れて見える。最も疑うものは？',options:['capture timestamp / pipeline latency の補償','gear tooth count','bolt torqueだけ','PID I項'],answer:0,explanation:'速度依存のpose遅れはtimestampとlatency補償をまず疑う。',frcContext:'vision retention',revision:1},
];

export const baselineIds = [
  'a-algebra-1','a-functions-1','a-trig-1','a-vector-1','a-diff-1','a-force-1','a-rotation-1',
  'a-ohm-1','a-power-1','a-wiring-1','a-can-1','a-fbd-1','a-gear-1','a-tolerance-1',
  'a-prog-1','a-debug-1','a-state-machine-1','a-feedback-1','a-pid-1','a-ff-1',
  'a-coord-1','a-odometry-1','a-vision-1','a-swerve-1','a-ai-data-1','a-ml-1'

];

export const baselineAssessments = baselineIds.map(id => assessments.find(a => a.id === id)!).filter(Boolean);
