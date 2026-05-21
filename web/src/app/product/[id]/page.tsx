import { ProductDetailsView } from "@/components/product/ProductDetailsView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({ params }: PageProps) {
  return <ProductDetailsView params={params} />;
}
