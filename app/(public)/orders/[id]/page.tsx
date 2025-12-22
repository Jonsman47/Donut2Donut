import { redirect } from "next/navigation";

export default function OrderDetailRedirect({ params }: { params: { id: string } }) {
  redirect(`/market/orders/${params.id}`);
}
