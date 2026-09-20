import type { PracticalSubmission } from './types';

export function practicalReady(submission: PracticalSubmission | undefined, checkIds: string[], needsReviewer = false) {
  return !!submission && submission.notes.trim().length >= 40 &&
    checkIds.every(id => submission.checks.includes(id)) &&
    (!needsReviewer || submission.reviewer.trim().length > 0);
}
export const workshopChecks = [
  { id: 'artifact', text: '計算・コード・図面・ログなど、課題で指定された成果物を残した。' },
  { id: 'verification', text: '達成目安と結果を比較し、失敗・誤差・未検証事項を記録した。' },
];
