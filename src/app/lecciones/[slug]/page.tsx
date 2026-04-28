import { notFound } from "next/navigation";
import { getLesson, getLessonSlugs } from "@/lib/lessons";
import { LessonClient } from "./LessonClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getLessonSlugs().map((slug) => ({ slug }));
}

export default async function LessonPage({ params }: PageProps) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();
  return <LessonClient slug={slug} />;
}
