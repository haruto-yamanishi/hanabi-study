// Difficulty describes the reasoning required, not the size of generated numbers.
const standardTopics=new Set(['simultaneous','quadratic','inverse','least-squares','limits','chain','extrema','ftc','partial','double-integral','series','epsilon','taylor','ode','euler','bayes','mean-ci','regression','induction','projectile','incline','collision','statics','beam','feedforward','estimation','transform','odometry','kinematics','trajectory','gradient']);
export function questionDifficulty(topicId:string):'basic'|'standard'{return standardTopics.has(topicId)?'standard':'basic';}
export const difficultyLabels={basic:'基礎ドリル',standard:'標準・接続問題'};
