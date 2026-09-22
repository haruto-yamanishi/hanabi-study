import { notFound } from 'next/navigation';
import { PrintableProblemSet, type PrintableProblem } from '@/components/PrintableProblemSet';
import { courseGroups, getQuestion, topics, type BankQuestion } from '@/data/foundations';

export default async function ProblemSetPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; ids?: string }>;
}) {
  const params = await searchParams;
  const topic = topics.find(item => item.id === params.topic);
  if (!topic) notFound();

  const requestedIds = (params.ids ?? '').split(',').filter(Boolean).slice(0, 20);
  const questions = requestedIds
    .map(id => getQuestion(id))
    .filter((question): question is BankQuestion => Boolean(question) && question.topicId === topic.id);

  if (!questions.length) notFound();

  const printable: PrintableProblem[] = questions.map(question => ({
    id: question.id,
    prompt: question.prompt,
    unit: question.unit,
    answer: question.answer,
    explanation: question.explanation,
    familyName: topic.families[question.family].name,
  }));

  return <PrintableProblemSet
    topicTitle={topic.title}
    groupName={courseGroups[topic.group]}
    questions={printable}
  />;
}
