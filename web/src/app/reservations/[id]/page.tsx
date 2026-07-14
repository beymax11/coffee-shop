import { Metadata } from "next";
import ReservationDetailView from "./ReservationDetailView";

export const metadata: Metadata = {
  title: "Reservation Details — Antonioni Grounds",
  description: "View your reservation details and submit your downpayment.",
};

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReservationDetailView reservationId={id} />;
}
