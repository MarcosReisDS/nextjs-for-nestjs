'use server';

import { createLoginSession, verifyPassword } from "@/lib/login/manage-login";
import { LoginSchema } from "@/lib/login/schemas";
import { apiRequest } from "@/utils/api-request";
import { asyncDelay } from "@/utils/async-delay";
import { getZodErrorMessage } from "@/utils/get-zod-error-messages";
import { redirect } from "next/navigation";

type LoginActionState = {
    email: string;
    errors: string[];
}

export async function loginAction(state: LoginActionState, formData: FormData) {
    const allowLogin = Boolean(Number(process.env.ALLOW_LOGIN));

    if (!allowLogin) {
        return {
            email: '',
            errors: ['Login not allowed']
        };
    }

    await asyncDelay(3000);

    if (!(formData instanceof FormData)) {
        return {
            email: '',
            errors: ['Dados inválidos']
        }
    }

    const formObj = Object.fromEntries(formData.entries());
    const formEmail = formObj?.email?.toString() || '';
    const parsedFormData = LoginSchema.safeParse(formObj);

    if (!parsedFormData.success) {
        return {
            email: formEmail,
            errors: getZodErrorMessage(parsedFormData.error.format()),
        }
    }

    // await createLoginSession(email);
    // redirect('/admin/post');

    const loginResponse = await apiRequest<{accessToken: string}>('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(parsedFormData.data)
    })

    if (!loginResponse.success) {
        return {
            email: formEmail,
            errors: loginResponse.errors,
        }
    }

    console.log(loginResponse.data);

    return {
        email: formEmail,
        errors: ['Success']
    }
}