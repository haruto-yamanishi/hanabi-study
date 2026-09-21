import { deepLessons } from './deep';
import { engineeringLessons } from './engineering';
import { Lesson } from '@/lib/types';

export const lessons: Lesson[] = [
  ...engineeringLessons,
  ...deepLessons,
  {
    id:'l-algebra-equations',skillId:'m-algebra',title:'方程式を「逆算」ではなく構造で解く',summary:'移項の暗記ではなく、等式の両辺に同じ操作をする感覚を作る。',estimatedMinutes:18,revision:1,
    steps:[
      {id:'c1',kind:'concept',title:'等式はバランス',body:'方程式は左右が等しい「天秤」。片側だけを勝手に変えず、両辺へ同じ操作をする。\\(2x+3=11\\)なら、両辺から3を引き、次に2で割る。'},
      {id:'e1',kind:'example',title:'例: \\(3(x-2)=15\\)',body:"まず両辺を3で割ると \\(x-2=5\\)。両辺に2を足して \\(x=7\\)。展開してから解いてもよいが、式の形を見て短い操作を選ぶ。"},
      {id:'r1',kind:'recall',title:'見ずに言える？',body:'画面を閉じたつもりで考える。',prompt:'「移項」は本当は何をしている操作？',options:['反対側へ瞬間移動','両辺に同じ加減算をしている','符号をランダムに変える'],answer:1,explanation:'移項は省略表現。等式の両辺へ同じ操作をしている。'},
      {id:'p1',kind:'practice',title:'FRCでの式変形',body:"\\(\\text{motor speed}=\\frac{\\text{free speed}}{\\text{gear ratio}}\\)。\\(\\mathrm{free} \\mathrm{speed}=6000 rpm\\)、出力を1200 rpmにしたい。gear ratioはいくつ？",prompt:'gear ratioを選ぶ',options:['2:1','5:1','12:1'],answer:1,explanation:'\\(\\frac{6000}{5}=1200\\)。'},
    ],checkpointIds:['a-algebra-1'],resourceIds:[]
  },
  {
    id:'l-trig-components',skillId:'m-trig',title:'sin / cosを力と速度の成分として使う',summary:'三角関数を暗記公式ではなく、ベクトルを分解する道具として使う。',estimatedMinutes:22,revision:1,
    steps:[
      {id:'c1',kind:'concept',title:'cosは横、sinは縦',body:"長さrのベクトルがx軸から\\(\\theta\\)なら、x成分は\\(r\\cos\\theta\\)、y成分は\\(r\\sin\\theta\\)。単位円は\\(r=1\\)の特別な場合。"},
      {id:'e1',kind:'example',title:"45°方向に\\(\\frac{2 m}{s}\\)",body:"\\(vx=2\\cos 45^{\\circ}\\approx 1.41\\)、\\(vy=2\\sin 45^{\\circ}\\approx 1.41\\)。swerveのchassis speedや力の分解で同じ構造が出る。"},
      {id:'r1',kind:'recall',title:'向きを変えるだけ',body:'長さは同じでも角度で成分が変わる。',prompt:"単位円上で\\(\\cos \\theta\\)は？",options:['x座標','y座標','角速度'],answer:0,explanation:'cosはx成分、sinはy成分。'},
      {id:'p1',kind:'practice',title:'robot-relative速度',body:"robotがfield x方向へ\\(\\frac{2 m}{s}\\)、y方向へ\\(\\frac{0 m}{s}\\)。robotが90°向きを変えたらrobot座標ではどの方向に見えるかを考える。",prompt:'必要になる考え方は？',options:['座標回転','Ohm則','binary search'],answer:0,explanation:'field/robot frame間の回転が必要。'},
    ],checkpointIds:['a-trig-1','a-coord-1'],resourceIds:[]
  },
  {
    id:'l-vectors-dot',skillId:'m-vectors',title:'ベクトルと内積',summary:'速度・力・向きの「同じ方向成分」を定量化する。',estimatedMinutes:20,revision:1,
    steps:[
      {id:'c1',kind:'concept',title:'ベクトルは大きさ＋向き',body:'位置、速度、力は方向を持つ。成分表示にすると足し算や変換がしやすい。'},
      {id:'e1',kind:'example',title:'内積',body:"\\(a=(1,2), b=(3,4)\\)なら\\(a\\cdot b=1\\times 3+2\\times 4=11\\)。幾何的には\\(|a||b|\\cos \\theta\\)。"},
      {id:'r1',kind:'recall',title:'内積が0なら？',body:'直交ベクトルの内積は0。',prompt:"\\(a\\cdot b=0\\)が示す代表的な関係は？",options:['平行','直交','同じ長さ'],answer:1,explanation:'非零ベクトルなら直交。'},
      {id:'p1',kind:'practice',title:'力の投影',body:'ある方向へ実際に効いている力を求めたいとき、方向単位ベクトルとの内積を使える。'},
    ],checkpointIds:['a-vector-1'],resourceIds:['res-linear']
  },
  {
    id:'l-derivative-motion',skillId:'m-calc-diff',title:'微分 = その瞬間の変化率',summary:"位置\\(\\to\\)速度\\(\\to\\)加速度、制御ログを微分の言葉で読む。",estimatedMinutes:24,revision:1,
    steps:[
      {id:'c1',kind:'concept',title:'傾きとしての微分',body:"\\(x(t)\\)の微分\\(\\frac{dx}{dt}\\)は速度。速度の微分は加速度。グラフでは接線の傾き。"},
      {id:'e1',kind:'example',title:"\\(x=t^{2}\\)",body:"\\(\\frac{dx}{dt}=2t\\)。\\(t=3 s\\)なら速度\\(\\frac{6 m}{s}\\)。位置が同じでも傾きが違えば速度は違う。"},
      {id:'r1',kind:'recall',title:'順番を言える？',body:'位置・速度・加速度のつながりを思い出す。',prompt:'速度を時間微分すると？',options:['位置','加速度','仕事'],answer:1,explanation:"\\(\\frac{dv}{dt}=a\\)。"},
      {id:'p1',kind:'practice',title:'D項との接続',body:'PIDのD項はerrorの変化率を見る。noiseが多いmeasurementを微分すると何が起きやすいか考える。',prompt:'一般に微分は高周波ノイズを？',options:['強調しやすい','必ず消す','無関係'],answer:0,explanation:'差分微分はnoiseを増幅しやすい。'},
    ],checkpointIds:['a-diff-1'],resourceIds:['res-calc-a']
  },
  {
    id:'l-forces-fma',skillId:'p-forces',title:"自由物体図から\\(F=ma\\)へ",summary:'機構に働く力を漏れなく切り出して、運動を予測する。',estimatedMinutes:25,revision:1,
    steps:[
      {id:'c1',kind:'concept',title:'まず対象を切り出す',body:'対象物だけを囲み、外から受ける力だけを描く。重力、支持力、摩擦、motor由来の力など。'},
      {id:'e1',kind:'example',title:'2 kgに6 N',body:"合力6 N、質量2 kgなら\\(a=\\frac{F}{m}=\\frac{3 m}{s^{2}}\\)。重要なのは単一の力でなく「合力」。"},
      {id:'r1',kind:'recall',title:'\\(F=ma\\)のFは？',body:'motor力そのものとは限らない。',prompt:'\\(F=ma\\)のFは何？',options:['対象に働く合力','最大motor force','重力だけ'],answer:0,explanation:'全外力のベクトル和。'},
      {id:'p1',kind:'practice',title:'Elevator',body:"上向き張力T、下向きmgなら\\(m a = T-mg\\)。静止保持では\\(a=0\\)なので\\(T=mg\\)。"},
    ],checkpointIds:['a-force-1','a-fbd-1'],resourceIds:[]
  },
  {
    id:'l-ohm-power',skillId:'e-ohm',title:'V・I・R・Pをrobotの言葉にする',summary:'オーム則と電力を、brownoutやwire lossまで接続する。',estimatedMinutes:22,revision:1,
    steps:[
      {id:'c1',kind:'concept',title:"\\(V=IR\\)",body:"電圧は「押す差」、電流は流れる量、抵抗は流れにくさ。\\(P=VI\\)で電力。"},
      {id:'e1',kind:'example',title:"\\(\\frac{10 V}{5} \\Omega\\)",body:"\\(I=\\frac{10}{5}=2 A\\)。\\(P=10\\times 2=20 W\\)。抵抗で失われる電力は\\(I^{2}R\\)でも同じ。"},
      {id:'r1',kind:'recall',title:'Voltage drop',body:'connectorやwireにも小さな抵抗がある。',prompt:"同じ抵抗で電流が2倍になると\\(I^{2}R \\mathrm{loss}\\)は？",options:['2倍','4倍','変わらない'],answer:1,explanation:"\\(I^{2}\\)に比例するので4倍。"},
      {id:'p1',kind:'practice',title:'FRC brownout',body:'高負荷時だけ電圧が落ちるなら、battery内部抵抗・connector・wire・機械負荷を含めて見る。'},
    ],checkpointIds:['a-ohm-1','a-power-1'],resourceIds:['res-circuits']
  },
  {
    id:'l-can-debug',skillId:'e-can',title:'CAN busを「魔法の線」にしない',summary:'物理配線、bus topology、device状態から故障を切り分ける。',estimatedMinutes:24,revision:1,
    steps:[
      {id:'c1',kind:'concept',title:'busとして考える',body:'CANは複数deviceが同じbusを共有する。途中断線やconnector不良は下流をまとめてofflineにすることがある。'},
      {id:'e1',kind:'example',title:'途中から全部offline',body:'特定device以降がまとめて消えたなら、その境界付近のCAN配線・connectorを優先確認する。'},
      {id:'r1',kind:'recall',title:'症状の範囲を見る',body:'1台だけか、複数台まとめてかで仮説が変わる。',prompt:'下流deviceがまとめてoffline。最初の有力候補は？',options:['境界付近の物理配線','gear ratio','gyro zero'],answer:0,explanation:'トポロジと症状範囲を対応させる。'},
      {id:'p1',kind:'practice',title:'Debug order',body:"電源\\(\\to\\)物理配線→device status→ID/firmware→trafficの順に、観測できる事実を増やしていく。"},
    ],checkpointIds:['a-can-1','a-edebug-1'],resourceIds:[]
  },
  {
    id:'l-gear-ratio',skillId:'me-gears',title:'Gear ratioで速度とトルクを交換する',summary:'歯数比をmechanism requirementへ接続する。',estimatedMinutes:20,revision:1,
    steps:[
      {id:'c1',kind:'concept',title:'減速すると何が起きる？',body:'理想系ではspeedを下げる代わりにtorqueを増やす。実機では効率損失がある。'},
      {id:'e1',kind:'example',title:"\\(12T \\to  60T\\)",body:"出力側/入力側\\(=\\frac{60}{12}=5\\):1 reduction。速度は約\\(\\frac{1}{5}\\)、torqueは理想で約5倍。"},
      {id:'r1',kind:'recall',title:'比を逆にしない',body:'どちらがdriverか、どちらがdrivenかを確認する。',prompt:'12Tが60Tを駆動する減速比は？',options:['1:5','5:1','72:1'],answer:1,explanation:"\\(\\frac{60}{12}=5\\)。"},
      {id:'p1',kind:'practice',title:'Requirementから選ぶ',body:'「free speedを何rpmにしたい」だけでなく、必要torqueとmotor currentも同時に見る。'},
    ],checkpointIds:['a-gear-1','a-motor-match-1'],resourceIds:[]
  },
  {
    id:'l-feedback-pid',skillId:'c-pid',title:'PIDをgainの暗記から挙動の読解へ',summary:'P/I/Dを、それぞれ何を見て何を補うかで理解する。',estimatedMinutes:30,revision:1,
    steps:[
      {id:'c1',kind:'concept',title:"\\(\\frac{\\frac{P}{I}}{D}\\)",body:'Pは今の誤差、Iは誤差の蓄積、Dは誤差の変化率を見る。まずPだけで挙動を観察し、必要に応じてI/Dを追加する。'},
      {id:'e1',kind:'example',title:'目標直前で振動',body:'Pが強すぎる、loop delayがある、mechanical backlashがある、Dが不足など複数原因があり得る。controllerだけ見ない。'},
      {id:'r1',kind:'recall',title:'I項の役割',body:'持続する小さな誤差に効く。',prompt:'I項が主に減らすものは？',options:['定常偏差','CAN latency','bearing frictionそのもの'],answer:0,explanation:'誤差を時間積分して補償する。'},
      {id:'p1',kind:'practice',title:'ログで調整',body:'setpoint、measurement、output、currentを同時に見る。波形の形からcontroller・機械・電源のどこを疑うか決める。'},
    ],checkpointIds:['a-pid-1','a-pid-debug-1'],resourceIds:[]
  },
  {
    id:'l-feedforward',skillId:'c-feedforward',title:'Feedforwardで「必要な力」を先に出す',summary:'誤差が出てから直すfeedbackと、モデルで先回りするfeedforwardを分ける。',estimatedMinutes:24,revision:1,
    steps:[
      {id:'c1',kind:'concept',title:'先回りする制御',body:'Feedforwardは目標速度や加速度、重力などから必要outputを予測する。feedbackは残った誤差を修正する。'},
      {id:'e1',kind:'example',title:'Elevator gravity',body:'停止保持でも重力に抗うoutputが必要。PIDだけなら誤差が出てから補うが、gravity FFなら最初から保持分を与えられる。'},
      {id:'r1',kind:'recall',title:'Feedbackとの違い',body:'両者は競合ではなく組み合わせる。',prompt:'Feedforwardが参照する中心情報は？',options:['目標運動とモデル','誤差だけ','CAN IDだけ'],answer:0,explanation:'モデルベースで必要入力を予測する。'},
      {id:'p1',kind:'practice',title:"\\(\\frac{\\frac{k_{S}}{k_{V}}}{k_{A}}\\)",body:'FRC characterizationでは静摩擦・速度・加速度への必要voltageを近似する。'},
    ],checkpointIds:['a-ff-1','a-profile-1'],resourceIds:[]
  },
  {
    id:'l-coordinates',skillId:'r-coordinates',title:'Field / Robot / Camera frameを混ぜない',summary:'座標系を明示してから変換する習慣を作る。',estimatedMinutes:26,revision:1,
    steps:[
      {id:'c1',kind:'concept',title:'数値には座標系がある',body:"同じ\\((1,0)\\)でもfield frameとrobot frameでは意味が違う。frame名を付けて考える。"},
      {id:'e1',kind:'example',title:"\\(+90^{\\circ} \\mathrm{rotation}\\)",body:"\\((1,0)\\)を\\(+90^{\\circ}\\)回転すると\\((0,1)\\)。2D rotation matrixで同じ計算を一般化できる。"},
      {id:'r1',kind:'recall',title:'field-relative drive',body:'driverのstickをfield座標で解釈し、robot headingでrobot座標へ変換する。',prompt:'必要なのは？',options:['座標変換','Ohm則','gear backlash補正だけ'],answer:0,explanation:'headingを使ったframe変換。'},
      {id:'p1',kind:'practice',title:'Camera transform',body:'AprilTag→camera poseとcamera→robot transformを合成してrobot poseを求める。順序を意識する。'},
    ],checkpointIds:['a-coord-1','a-swerve-1'],resourceIds:['res-robot']
  },
  {
    id:'l-odometry',skillId:'r-odometry',title:'Odometryとdrift',summary:'encoderとgyroからposeを積分し、なぜずれるかを理解する。',estimatedMinutes:25,revision:1,
    steps:[
      {id:'c1',kind:'concept',title:'小さな移動を積み上げる',body:'各周期のwheel移動やheading変化からpose deltaを求めて積算する。'},
      {id:'e1',kind:'example',title:'1%の誤差も積もる',body:'wheel radius、slip、gyro biasなどの小さな誤差が長時間でpose driftになる。'},
      {id:'r1',kind:'recall',title:'絶対観測との違い',body:'odometryは相対変化を積む。visionはfield基準の絶対情報を与えられる。',prompt:'odometryがdriftする主因は？',options:['誤差の積算','毎周期GPSで補正','gearが消える'],answer:0,explanation:'相対測定誤差を積算するため。'},
      {id:'p1',kind:'practice',title:'Vision fusion',body:'visionを足すときはmeasurement timestampと信頼度を扱う必要がある。'},
    ],checkpointIds:['a-odometry-1','a-localization-1'],resourceIds:['res-robot']
  },
  {
    id:'l-debug-method',skillId:'r-integration',title:'FRC不具合を横断して切り分ける',summary:'機械・電装・softwareを「担当」で分けず、観測可能な仮説で切り分ける。',estimatedMinutes:32,revision:1,
    steps:[
      {id:'c1',kind:'concept',title:"症状\\(\\to\\)仮説\\(\\to\\)観測",body:'いきなり部品交換しない。再現条件を固定し、原因候補ごとに「何を測れば否定できるか」を決める。'},
      {id:'e1',kind:'example',title:'Elevatorが遅い',body:'mechanical binding、ratio/load、battery sag、current limit、controller output、sensor scalingなどを同じtimelineのログと実測で比較する。'},
      {id:'r1',kind:'recall',title:'良い最初の質問',body:'「誰の担当？」より先に症状の条件を取る。',prompt:'最初に揃えたいものは？',options:['再現条件と観測ログ','新しいlogo','random tuning'],answer:0,explanation:'再現性と観測がroot cause analysisの土台。'},
      {id:'p1',kind:'practice',title:'Capstone scenario',body:'motor current↑、battery voltage↓、速度↓。mechanical loadとelectrical supplyを同時に疑い、切り分け手順を考える。'},
    ],checkpointIds:['a-integration-1'],resourceIds:[]
  },
];
