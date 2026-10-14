import { SpinLoader } from "@/components/SpinLoader";
import { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: 'Trocar senha'
}

export default async function AdminPasswordPage() {

    return (
        <Suspense fallback={<SpinLoader className="mb-16" />}>
        </Suspense>
    )
}