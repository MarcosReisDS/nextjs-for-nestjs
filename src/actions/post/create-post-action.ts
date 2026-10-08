'use server';

import { getLoginSessionFromApi } from "@/lib/login/manage-login";
import { CreatePostForApiSchema, PublicePostForApiDto, PublicPostForApiSchema } from "@/lib/post/schemas";
import { authenticatedApiRequest } from "@/utils/authenticated-api-request";
import { getZodErrorMessage } from "@/utils/get-zod-error-messages";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

type CreatePostActionState = {
    formState: PublicePostForApiDto;
    erros: string[];
    success?: string;
}

export async function createPostAction(
    prevState: CreatePostActionState,
    formData: FormData,
): Promise<CreatePostActionState> {
    const isAuthenticated = await getLoginSessionFromApi();

    if (!(formData instanceof FormData)) {
        return {
            formState: prevState.formState,
            erros: ['Dados inválidos']
        }
    }

    const formDataObj = Object.fromEntries(formData.entries());
    const zodParseObj = CreatePostForApiSchema.safeParse(formDataObj)

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
            formState: PublicPostForApiSchema.parse(formDataObj)
        }
    }

    const newPost = zodParseObj.data;

    const createPostResponse = await authenticatedApiRequest<PublicePostForApiDto>(
        `/post/me`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newPost)
        }
    )

    if(!createPostResponse.success) {
        return {
            formState: PublicPostForApiSchema.parse(formDataObj),
            erros: createPostResponse.errors,
        }
    }

    const createdPost = createPostResponse.data;

    // @ts-ignore
    revalidateTag('posts')
    redirect(`/admin/post/${createdPost.id}?created=1`)
}