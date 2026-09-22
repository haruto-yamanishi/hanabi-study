import { notFound } from 'next/navigation';
import { PrintableLesson } from '@/components/PrintableLesson';
import { assessments } from '@/data/assessments';
import { skills } from '@/data/curriculum';
import { lessons } from '@/data/lessons';
import type { AssessmentItem } from '@/lib/types';

export default async function LessonPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ lesson?: string }>;
}) {
  const { lesson: lessonId } = await searchParams;
  const lesson = lessons.find(item => item.id === lessonId);
  if (!lesson) notFound();

  const skill = skills.find(item => item.id === lesson.skillId);
  if (!skill) notFound();

  const checkpoints = lesson.checkpointIds
    .map(id => assessments.find(item => item.id === id))
    .filter((item): item is AssessmentItem => Boolean(item));

  return <PrintableLesson lesson={lesson} skill={skill} checkpoints={checkpoints}/>;
}
