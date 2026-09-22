'use client';

import { MathText } from './MathText';
import { PrintToolbar } from './PrintToolbar';

export type PrintableProblem = {
  id: string;
  prompt: string;
  unit: string;
  answer: number;
  explanation: string;
  familyName: string;
};

export function PrintableProblemSet({
  topicTitle,
  groupName,
  questions,
}: {
  topicTitle: string;
  groupName: string;
  questions: PrintableProblem[];
}) {
  return <main className="print-page-shell">
    <PrintToolbar/>
    <article className="print-paper">
      <header className="print-document-header">
        <div>
          <div className="print-eyebrow">HANABI STUDY · WORKSHEET</div>
          <h1>{topicTitle}</h1>
          <p className="print-subtitle">{groupName} · {questions.length}問</p>
        </div>
        <img src="/brand/hanabi-normal.png" alt="Hanabi" className="print-logo"/>
      </header>

      <section className="print-summary print-workbook-info">
        <p>途中式・単位・判断根拠を紙に残してから解答を確認する。</p>
        <div className="print-name-line">Name: <span/> Date: <span/></div>
      </section>

      <section>
        {questions.map((question, index) => <div key={question.id} className="print-question print-workbook-question">
          <div className="print-question-meta">Q{index + 1} · {question.familyName}</div>
          <div className="print-question-text"><MathText>{question.prompt}</MathText></div>
          <div className="print-answer-box">Answer: ____________________ {question.unit}</div>
          <div className="print-writing-lines print-writing-lines-large" aria-hidden="true">
            <span/><span/><span/><span/>
          </div>
        </div>)}
      </section>

      <section className="print-break-before">
        <div className="print-eyebrow">ANSWER KEY</div>
        <h2 className="print-major-heading">{topicTitle} · 解答と解説</h2>
        {questions.map((question, index) => <div key={question.id} className="print-answer-item">
          <h3>Q{index + 1} · <MathText>{String(question.answer)}</MathText> {question.unit}</h3>
          <div><MathText>{question.explanation}</MathText></div>
        </div>)}
      </section>

      <footer className="print-footer">FRC Team 9494 Hanabi · Hanabi Study</footer>
    </article>
  </main>;
}
