'use client';

import { MathText } from './MathText';
import { PrintToolbar } from './PrintToolbar';
import type { AssessmentItem, Lesson, Skill } from '@/lib/types';

function exerciseAnswer(step: Lesson['steps'][number]) {
  if (step.options && step.answer !== undefined) return `${String.fromCharCode(65 + step.answer)}. ${step.options[step.answer] ?? ''}`;
  if (step.numericAnswer !== undefined) return String(step.numericAnswer);
  return '';
}

function checkpointAnswer(item: AssessmentItem) {
  if (item.format === 'mcq' && typeof item.answer === 'number') {
    return `${String.fromCharCode(65 + item.answer)}. ${item.options?.[item.answer] ?? ''}`;
  }
  return String(item.answer);
}

export function PrintableLesson({
  lesson,
  skill,
  checkpoints,
}: {
  lesson: Lesson;
  skill: Skill;
  checkpoints: AssessmentItem[];
}) {
  return <main className="print-page-shell">
    <PrintToolbar/>
    <article className="print-paper">
      <header className="print-document-header">
        <div>
          <div className="print-eyebrow">HANABI STUDY · LESSON</div>
          <h1>{lesson.title}</h1>
          <p className="print-subtitle">{skill.section} · {skill.nameJa}</p>
        </div>
        <img src="/brand/hanabi-normal.png" alt="Hanabi" className="print-logo"/>
      </header>

      <section className="print-summary">
        <p>{lesson.summary}</p>
        <div>目安 {lesson.estimatedMinutes} min · rev.{lesson.revision}</div>
      </section>

      {lesson.steps.map((step, index) => <section key={step.id} className="print-section">
        <div className="print-section-label">{String(index + 1).padStart(2, '0')} · {step.kind}</div>
        <h2><MathText>{step.title}</MathText></h2>
        <div className="print-body"><MathText>{step.body}</MathText></div>

        {step.prompt && <div className="print-exercise">
          <div className="print-exercise-label">Exercise</div>
          <div className="print-question-text"><MathText>{step.prompt}</MathText></div>
          {step.options && <ol className="print-options" type="A">
            {step.options.map(option => <li key={option}><MathText>{option}</MathText></li>)}
          </ol>}
          {!step.options && <div className="print-writing-lines" aria-hidden="true">
            <span/><span/><span/>
          </div>}
          {(exerciseAnswer(step) || step.explanation) && <div className="print-inline-answer">
            {exerciseAnswer(step) && <p><strong>答え：</strong><MathText>{exerciseAnswer(step)}</MathText></p>}
            {step.explanation && <p><strong>解説：</strong><MathText>{step.explanation}</MathText></p>}
          </div>}
        </div>}
      </section>)}

      {checkpoints.length > 0 && <section className="print-break-before">
        <div className="print-eyebrow">CLOSED-BOOK CHECKPOINT</div>
        <h2 className="print-major-heading">理解確認</h2>
        {checkpoints.map((item, index) => <div key={item.id} className="print-question">
          <div className="print-question-meta">Q{index + 1} · {item.competency} · Lv.{item.difficulty}</div>
          <div className="print-question-text"><MathText>{item.prompt}</MathText></div>
          {item.options && <ol className="print-options" type="A">
            {item.options.map(option => <li key={option}><MathText>{option}</MathText></li>)}
          </ol>}
          {!item.options && <div className="print-answer-box">Answer:</div>}
        </div>)}
      </section>}

      {checkpoints.length > 0 && <section className="print-break-before">
        <div className="print-eyebrow">ANSWER KEY</div>
        <h2 className="print-major-heading">チェックポイント解答</h2>
        {checkpoints.map((item, index) => <div key={item.id} className="print-answer-item">
          <h3>Q{index + 1} · <MathText>{checkpointAnswer(item)}</MathText></h3>
          <div><MathText>{item.explanation}</MathText></div>
        </div>)}
      </section>}

      <footer className="print-footer">FRC Team 9494 Hanabi · Hanabi Study</footer>
    </article>
  </main>;
}
