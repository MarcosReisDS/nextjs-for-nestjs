'use server';

import { getLoginSessionFromApi } from "@/lib/login/manage-login";
import { PublicePostForApiDto, PublicPostForApiSchema, UpdatePostForApiSchema } from "@/lib/post/schemas";
import { authenticatedApiRequest } from "@/utils/authenticated-api-request";
import { getZodErrorMessage } from "@/utils/get-zod-error-messages";
import { revalidateTag } from "next/cache";

type UpdatePostActionState = {
    formState: PublicePostForApiDto;
    erros: string[];
    success?: string;
}

export async function updatePostAction(
    prevState: UpdatePostActionState,
    formData: FormData,

): Promise<UpdatePostActionState> {
    const isAuthenticated = await getLoginSessionFromApi();

    if (!(formData instanceof FormData)) {
        return {
            formState: prevState.formState,
            erros: ['Dados inválidos']
        }
    }

    const id = formData.get('id')?.toString() || '';

    if (!id || typeof id !== 'string') {
        return {
            formState: prevState.formState,
            erros: ['ID inválido']
        }
    }

    const formDataObj = Object.fromEntries(formData.entries());
    const zodParseObj = UpdatePostForApiSchema.safeParse(formDataObj)

    if (!isAuthenticated) {
        return {
            formState: PublicPostForApiSchema.parse(formDataObj),
            erros: ['Faça login em outra aba antes de salvar.'],
        };
    }

    if (!zodParseObj.success) {
        const errors = getZodErrorMessage(zodParseObj.error.format());
        return {
            erros: errors,
            formState: PublicPostForApiSchema.parse(formDataObj),
        }
    }

    const newPost = zodParseObj.data;

    const updatePostResponse = await authenticatedApiRequest<PublicePostForApiDto>(
        `/post/me/${id}`,
        {
            method: 'PATCH',
            body: JSON.stringify(newPost),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )

    if (!updatePostResponse.success) {
        return {
            formState: PublicPostForApiSchema.parse(formDataObj),
            erros: updatePostResponse.errors,
        }
    }

    const post = updatePostResponse.data;

    // @ts-ignore
    revalidateTag('posts')
    // @ts-ignore
    revalidateTag(`post-${post.slug}`)

    return {
        formState: PublicPostForApiSchema.parse(post),
        erros: [],
        success: "kdaskdsadk"
    }
}