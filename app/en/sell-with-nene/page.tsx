import type { Metadata } from "next";
import { ConsignmentPage } from "@/components/ConsignmentPage";
export const metadata: Metadata = { title: "Sell with Nene | Baby & Parent Consignment", description: "Give pre-loved baby and parent essentials a thoughtful new beginning." };
export default function Page() { return <ConsignmentPage locale="en" />; }
