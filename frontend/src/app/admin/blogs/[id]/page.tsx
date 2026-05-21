import AdminBlogReview from "@/components/blog/admin/AdminBlogReview";

export default function AdminBlogReviewPage({
  params,
}: {
  params: { id: string };
}) {
  return <AdminBlogReview blogId={params.id} />;
}
