'use server';

import { deleteLoginSession } from "@/lib/login/manage-login";
import { getPublicUserFromApi } from "@/lib/user/api/get-user";
import { CreateUserSchema, PublicUserDto, PublicUserSchema } from "@/lib/user/schemas";
import { authenticatedApiRequest } from "@/utils/authenticated-api-request";
import { getZodErrorMessage } from "@/utils/get-zod-error-messages";
import { redirect } from "next/navigation";

type UpdateUserActionState = {
    user: PublicUserDto;
    errors: string[];
    success: boolean
}

export async function updateUserAction(
    state: UpdateUserActionState,
    formData: FormData
): Promise<UpdateUserActionState> {
    const user = await getPublicUserFromApi()

    if (!user) {
        await deleteLoginSession();

        return {
            user: state.user,
            errors: ['Você precisa fazer login novamente'],
            success: false
        }
    }

    if (!(formData instanceof FormData)) {
        return {
            user: state.user,
            errors: ['Dados inválidos'],
            success: false
        }
    }

    const formObj = Object.fromEntries(formData.entries())
    const parsedFormData = CreateUserSchema.safeParse(formObj)

    if (!parsedFormData.success) {
        return {
            user: PublicUserSchema.parse(formObj),
            errors: getZodErrorMessage(parsedFormData.error.format()),
            success: false
        }
    }

    const updateResponse = await authenticatedApiRequest<PublicUserDto>(
        '/user/me',
        {
            method: 'PATCH',
            body: JSON.stringify(parsedFormData.data),
            headers: {
                'Content-Type': 'application/json'
            }
        })

    if (!updateResponse.success) {
        return {
            user: PublicUserSchema.parse(formObj),
            errors: updateResponse.errors,
            success: updateResponse.success
        }
    }

    if (user.email !== updateResponse.data.email) {
        await deleteLoginSession()
        redirect('/login?userChanged=1')
    }

    // @ts-ignore
    // revalidateTag('posts')

    return {
        user: PublicUserSchema.parse(updateResponse.data),
        errors: [],
        success: true
    }
}