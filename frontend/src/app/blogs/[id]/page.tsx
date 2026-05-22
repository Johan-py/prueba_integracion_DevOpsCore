import { redirect } from "next/navigation";

export default function LegacyBlogDetailRedirect({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/blog/${params.id}`);
}
