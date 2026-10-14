import { SpinLoader } from "@/components/SpinLoader";
import { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: 'User admin'
}

export default async function AdminUserPage() {

    return (
        <Suspense fallback={<SpinLoader className="mb-16" />}>
        </Suspense>
    )
}