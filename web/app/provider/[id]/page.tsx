import ProviderDetailClient from "./ProviderDetailClient";

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProviderDetailClient id={id} />;
}
