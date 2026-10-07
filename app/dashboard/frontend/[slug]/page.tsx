import { FrontendWorkspace } from "@/components/FrontendWorkspace";
import { FRONTEND_SLUGS } from "@/lib/problem-slugs";

export function generateStaticParams() {
  return FRONTEND_SLUGS.map((slug) => ({ slug }));
}

export default async function Page({ params }: PageProps<"/dashboard/frontend/[slug]">) {
  const { slug } = await params;
  return <FrontendWorkspace slug={slug} />;
}
