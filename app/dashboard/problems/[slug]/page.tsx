import { ProblemWorkspace } from "@/components/ProblemWorkspace";
import { PROBLEM_SLUGS } from "@/lib/problem-slugs";

export function generateStaticParams() {
  return PROBLEM_SLUGS.map((slug) => ({ slug }));
}

export default async function Page({ params }: PageProps<"/dashboard/problems/[slug]">) {
  const { slug } = await params;
  return <ProblemWorkspace slug={slug} />;
}
