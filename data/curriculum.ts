import { Skill, Resource, DiagnosticQuestion } from '@/lib/types';

export const skills: Skill[] = [
  {id:'m-arithmetic',domain:'math',nameJa:'数と式',nameEn:'Arithmetic & Algebra Basics',description:'割合・符号・指数・式変形を迷わず扱う。',prerequisites:[],importance:10,x:0,y:0},
  {id:'m-functions',domain:'math',nameJa:'関数とグラフ',nameEn:'Functions & Graphs',description:'関数を式・表・グラフの3表現で行き来する。',prerequisites:['m-arithmetic'],importance:10,x:0,y:140},
  {id:'m-trig',domain:'math',nameJa:'三角関数',nameEn:'Trigonometry',description:'sin/cosを幾何・周期関数・ベクトル成分として扱う。',prerequisites:['m-functions'],importance:10,x:-220,y:280},
  {id:'m-vectors',domain:'math',nameJa:'ベクトル',nameEn:'Vectors',description:'内積・基底・座標表現を理解し、空間の量を表す。',prerequisites:['m-functions'],importance:10,x:0,y:280},
  {id:'m-calc1',domain:'math',nameJa:'一変数微積分',nameEn:'Single-variable Calculus',description:'極限・微分・積分を変化率と累積として理解する。',prerequisites:['m-functions','m-trig'],importance:10,x:220,y:280},
  {id:'m-linear',domain:'math',nameJa:'線形代数',nameEn:'Linear Algebra',description:'連立方程式、行列、線形写像、固有値を扱う。',prerequisites:['m-vectors'],importance:10,x:-80,y:430},
  {id:'m-calc2',domain:'math',nameJa:'多変数微積分',nameEn:'Multivariable Calculus',description:'偏微分・勾配・ヤコビアン・多重積分を扱う。',prerequisites:['m-calc1','m-vectors'],importance:9,x:210,y:430},
  {id:'m-ode',domain:'math',nameJa:'常微分方程式',nameEn:'Ordinary Differential Equations',description:'運動・回路・制御の時間発展を微分方程式で解く。',prerequisites:['m-calc1','m-linear'],importance:10,x:80,y:580},
  {id:'m-prob',domain:'math',nameJa:'確率・統計',nameEn:'Probability & Statistics',description:'確率変数・分布・期待値・条件付き確率を扱う。',prerequisites:['m-calc1'],importance:9,x:340,y:580},
  {id:'m-opt',domain:'math',nameJa:'最適化',nameEn:'Optimization',description:'勾配法・凸性・制約付き最適化の基礎を扱う。',prerequisites:['m-linear','m-calc2'],importance:9,x:190,y:730},

  {id:'p-mech',domain:'physics',nameJa:'古典力学',nameEn:'Classical Mechanics',description:'運動方程式、仕事、エネルギー、運動量を理解する。',prerequisites:['m-vectors','m-calc1'],importance:10,x:570,y:280},
  {id:'p-rotation',domain:'physics',nameJa:'回転運動',nameEn:'Rotational Dynamics',description:'トルク、慣性モーメント、角運動量を扱う。',prerequisites:['p-mech','m-trig'],importance:10,x:570,y:430},
  {id:'p-em',domain:'physics',nameJa:'電磁気の基礎',nameEn:'Electromagnetism',description:'電場・電位・磁場・誘導を回路へ接続する。',prerequisites:['m-vectors','m-calc1'],importance:8,x:770,y:280},

  {id:'e-circuits',domain:'electronics',nameJa:'直流・交流回路',nameEn:'Circuit Analysis',description:'KCL/KVL、RC/RL/RLC、複素インピーダンスを扱う。',prerequisites:['m-arithmetic','m-ode','p-em'],importance:10,x:760,y:520},
  {id:'e-digital',domain:'electronics',nameJa:'デジタル回路',nameEn:'Digital Logic',description:'論理回路、フリップフロップ、状態機械を理解する。',prerequisites:['m-arithmetic'],importance:8,x:950,y:380},
  {id:'e-embedded',domain:'electronics',nameJa:'組み込み基礎',nameEn:'Embedded Systems',description:'MCU、GPIO、PWM、ADC、割り込み、通信を扱う。',prerequisites:['e-circuits','e-digital','cs-programming'],importance:10,x:950,y:570},

  {id:'me-statics',domain:'mechanical',nameJa:'材料・静力学基礎',nameEn:'Statics & Strength Basics',description:'力の釣り合い、応力・ひずみ、梁の基礎を扱う。',prerequisites:['p-mech'],importance:8,x:570,y:610},
  {id:'me-dynamics',domain:'mechanical',nameJa:'機械力学・振動',nameEn:'Mechanical Dynamics & Vibration',description:'1/2自由度振動、共振、減衰をモデル化する。',prerequisites:['p-mech','m-ode'],importance:9,x:570,y:760},

  {id:'cs-programming',domain:'cs',nameJa:'プログラミング基礎',nameEn:'Programming Fundamentals',description:'制御構造、関数、データ構造、デバッグを自力で扱う。',prerequisites:[],importance:10,x:-450,y:0},
  {id:'cs-algorithms',domain:'cs',nameJa:'アルゴリズムと計算量',nameEn:'Algorithms & Complexity',description:'探索・ソート・グラフ・計算量を理解する。',prerequisites:['cs-programming'],importance:8,x:-450,y:160},
  {id:'cs-systems',domain:'cs',nameJa:'コンピュータシステム',nameEn:'Computer Systems',description:'メモリ、プロセス、I/O、ネットワークの基礎を理解する。',prerequisites:['cs-programming'],importance:8,x:-620,y:320},

  {id:'c-feedback',domain:'control',nameJa:'フィードバックとPID',nameEn:'Feedback & PID',description:'閉ループ、安定性、P/I/D各項の役割を説明・調整する。',prerequisites:['m-ode','e-circuits'],importance:10,x:360,y:900},
  {id:'c-state',domain:'control',nameJa:'状態空間',nameEn:'State Space Control',description:'状態方程式、可制御性、極配置、LQRの基礎を扱う。',prerequisites:['m-linear','m-ode','c-feedback'],importance:10,x:330,y:1060},
  {id:'c-estimation',domain:'control',nameJa:'状態推定',nameEn:'State Estimation',description:'観測器・カルマンフィルタの考え方を扱う。',prerequisites:['m-prob','c-state'],importance:9,x:500,y:1210},

  {id:'r-coordinates',domain:'robotics',nameJa:'座標変換',nameEn:'Coordinate Transforms',description:'回転行列、同次変換、座標系の合成を扱う。',prerequisites:['m-linear','m-trig'],importance:10,x:-80,y:900},
  {id:'r-kinematics',domain:'robotics',nameJa:'順・逆運動学',nameEn:'Forward & Inverse Kinematics',description:'関節空間と作業空間を相互に変換する。',prerequisites:['r-coordinates','m-calc2'],importance:10,x:-100,y:1060},
  {id:'r-dynamics',domain:'robotics',nameJa:'ロボット動力学',nameEn:'Robot Dynamics',description:'ラグランジュ/ニュートン・オイラーで運動を記述する。',prerequisites:['r-kinematics','p-rotation','m-ode'],importance:10,x:-90,y:1220},
  {id:'r-planning',domain:'robotics',nameJa:'軌道・モーションプランニング',nameEn:'Motion Planning',description:'軌道生成、探索、衝突回避を扱う。',prerequisites:['r-kinematics','cs-algorithms','m-opt'],importance:9,x:-300,y:1380},
  {id:'r-ros',domain:'robotics',nameJa:'ROS 2',nameEn:'ROS 2',description:'Node/Topic/Service/TFを理解しロボットソフトを統合する。',prerequisites:['cs-programming','r-coordinates'],importance:8,x:-500,y:1060},

  {id:'ai-ml',domain:'ai',nameJa:'機械学習基礎',nameEn:'Machine Learning',description:'教師あり学習、損失、汎化、評価を理解する。',prerequisites:['m-linear','m-prob','m-opt','cs-programming'],importance:9,x:720,y:900},
  {id:'ai-dl',domain:'ai',nameJa:'深層学習',nameEn:'Deep Learning',description:'ニューラルネット、誤差逆伝播、最適化を理解・実装する。',prerequisites:['ai-ml','m-calc2'],importance:9,x:720,y:1060},
  {id:'ai-rl',domain:'ai',nameJa:'強化学習',nameEn:'Reinforcement Learning',description:'MDP、価値関数、Q学習、Policy Gradientを扱う。',prerequisites:['m-prob','m-opt','ai-ml'],importance:9,x:720,y:1220},
  {id:'ai-robotlearning',domain:'ai',nameJa:'Robot Learning / Physical AI',nameEn:'Robot Learning / Physical AI',description:'知覚・制御・学習を統合し実世界ロボットへ適用する。',prerequisites:['ai-dl','ai-rl','r-dynamics','c-estimation'],importance:10,x:450,y:1430}
];

export const resources: Resource[] = [
  {id:'res-calc-a',title:'微分積分学 A',provider:'京都大学OCW',url:'https://ocw.kyoto-u.ac.jp/course/547/',skills:['m-functions','m-calc1'],format:'講義ノート',note:'極限から微分・積分まで。大学理系1年の基礎を厳密さも含めて学ぶ。'},
  {id:'res-calc-b',title:'微分積分学 B',provider:'京都大学OCW',url:'https://ocw.kyoto-u.ac.jp/course/546/',skills:['m-calc2'],format:'講義ノート',note:'多変数微積分、偏微分、変数変換まで。'},
  {id:'res-linear',title:'線型代数学 A',provider:'京都大学OCW',url:'https://ocw.kyoto-u.ac.jp/course/730/',skills:['m-linear'],format:'講義動画',note:'連立一次方程式を軸に線形代数の理論へ進む。'},
  {id:'res-ode',title:'自然現象と数学',provider:'京都大学OCW',url:'https://ocw.kyoto-u.ac.jp/course/123/',skills:['m-ode','e-circuits'],format:'講義資料',note:'微分方程式を現象・交流回路へ接続する。'},
  {id:'res-circuits',title:'電気電子回路演習',provider:'京都大学OCW',url:'https://ocw.kyoto-u.ac.jp/course/3/',skills:['e-circuits'],format:'動画 + 資料',note:'LTspice・Octave・回路実験を往復する実践型。'},
  {id:'res-robot',title:'ロボット工学（講義資料）',provider:'東京電機大学 井上研究室',url:'https://www.rm.dendai.ac.jp/inouelab/inoue/class/robot/robot.html',skills:['r-coordinates','r-kinematics','c-state'],format:'講義資料 + MATLAB',note:'運動学、逆運動学、LQR等の公開教材。'},
  {id:'res-manip',title:'マニピュレータ：運動学と逆運動学',provider:'東北学院大学',url:'https://www.mech.tohoku-gakuin.ac.jp/rde/contents/course/__robotics/manipulator.html',skills:['r-kinematics'],format:'Web教材',note:'順運動学・逆運動学を日本語で整理。'},
  {id:'res-dl',title:'Deep Learning基礎講座 2023',provider:'東京大学 松尾研究室 / Deep Learning JP',url:'https://deeplearning.jp/lectures/dlb2023/',skills:['ai-ml','ai-dl'],format:'公開講座',note:'ニューラルネット基礎から実践まで。'}
];

export const diagnostics: DiagnosticQuestion[] = [
  {id:'q1',skillId:'m-arithmetic',difficulty:1,prompt:'2(x - 3) = 14 を満たす x は？',options:['4','7','10','17'],answer:2,explanation:'2x-6=14 → 2x=20 → x=10。'},
  {id:'q2',skillId:'m-functions',difficulty:1,prompt:'f(x)=x² の x=3 における値は？',options:['3','6','9','27'],answer:2,explanation:'f(3)=3²=9。'},
  {id:'q3',skillId:'m-trig',difficulty:1,prompt:'単位円で cos θ が表すものは？',options:['点のx座標','点のy座標','弧の長さそのもの','原点からの距離'],answer:0,explanation:'単位円上の点 (cosθ, sinθ) のx座標。'},
  {id:'q4',skillId:'m-vectors',difficulty:2,prompt:'a=(1,2), b=(3,4) の内積 a·b は？',options:['7','10','11','14'],answer:2,explanation:'1×3+2×4=11。'},
  {id:'q5',skillId:'m-calc1',difficulty:2,prompt:'f(x)=x² の導関数は？',options:['x','2x','x²/2','2'],answer:1,explanation:'べき乗則より d(x²)/dx=2x。'},
  {id:'q6',skillId:'m-linear',difficulty:2,prompt:'行列 A の固有ベクトル v の定義として正しいものは？',options:['Av=0','Av=v²','Av=λv','A+v=λ'],answer:2,explanation:'0でないvについて Av=λv を満たす。'},
  {id:'q7',skillId:'m-ode',difficulty:2,prompt:'dx/dt = -kx (k>0) の解の形として適切なのは？',options:['x=C+kt','x=Ce^{-kt}','x=Ct²','x=C/k'],answer:1,explanation:'一次の線形微分方程式で指数減衰する。'},
  {id:'q8',skillId:'p-mech',difficulty:1,prompt:'質量2 kgの物体に6 Nの合力。加速度は？',options:['2 m/s²','3 m/s²','6 m/s²','12 m/s²'],answer:1,explanation:'F=ma → a=6/2=3。'},
  {id:'q9',skillId:'e-circuits',difficulty:2,prompt:'10 V電源に5 Ω抵抗を接続したときの電流は？',options:['0.5 A','2 A','5 A','50 A'],answer:1,explanation:'I=V/R=10/5=2 A。'},
  {id:'q10',skillId:'c-feedback',difficulty:2,prompt:'PIDのI項が主に減らすものは？',options:['定常偏差','センサ分解能','サンプリング周期','モータ定格'],answer:0,explanation:'積分項は持続する誤差を積み上げて定常偏差を除去する方向に働く。'},
  {id:'q11',skillId:'r-coordinates',difficulty:2,prompt:'2Dで座標系を90°回転させる操作に最も直接使うものは？',options:['回転行列','フーリエ変換','ハッシュ表','ヒープ'],answer:0,explanation:'座標回転は回転行列で表現する。'},
  {id:'q12',skillId:'r-kinematics',difficulty:2,prompt:'順運動学が計算する方向は？',options:['手先姿勢→関節角','関節角→手先姿勢','画像→深度','速度→電流'],answer:1,explanation:'関節変位から手先位置・姿勢を求める。'},
  {id:'q13',skillId:'m-prob',difficulty:2,prompt:'独立な事象A,Bについて P(A∩B) は？',options:['P(A)+P(B)','P(A)P(B)','P(A)/P(B)','1-P(A)'],answer:1,explanation:'独立なら積で表せる。'},
  {id:'q14',skillId:'ai-ml',difficulty:2,prompt:'訓練誤差は低いが未知データで誤差が高い状態は？',options:['過学習','アンダーフロー','量子化','正規化'],answer:0,explanation:'学習データへ適合しすぎ、汎化できていない。'},
  {id:'q15',skillId:'ai-rl',difficulty:2,prompt:'Q(s,a) が表すものとして最も近いのは？',options:['状態sで行動aを取った後の期待累積報酬','画像の画素値','教師ラベル','学習率'],answer:0,explanation:'Q値は状態・行動対の期待収益を表す。'},
  {id:'q16',skillId:'me-dynamics',difficulty:2,prompt:'減衰が小さい1自由度系で、外力周波数が固有振動数に近いと起こりやすいのは？',options:['共振','静電遮蔽','量子化','エイリアシング'],answer:0,explanation:'強制振動の周波数が固有振動数に近いと振幅が大きくなる。'}
];
