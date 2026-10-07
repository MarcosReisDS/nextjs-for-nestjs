'use server';

import { makePartialPublicPost, makePublicPostFromDb, PublicPost } from "@/dto/post/dto";
import { verifyLoginSession } from "@/lib/login/manage-login";
import { PostUpdateSchema } from "@/lib/post/schemas";
import { postRepository } from "@/repositories/post";
import { getZodErrorMessage } from "@/utils/get-zod-error-messages";
import { revalidateTag } from "next/cache";

type UpdatePostActionState = {
    formState: PublicPost;
    erros: string[];
    success?: string;
}

export async function updatePostAction(
    prevState: UpdatePostActionState,
    formData: FormData,

): Promise<UpdatePostActionState> {
    const isAuthenticated = await verifyLoginSession();

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
    const zodParseObj = PostUpdateSchema.safeParse(formDataObj)

    if (!isAuthenticated) {
        return {
            formState: makePartialPublicPost(formDataObj),
            erros: ['Faça login em outra aba antes de salvar.'],
        };
    }

    if (!zodParseObj.success) {
        const errors = getZodErrorMessage(zodParseObj.error.format());
        return {
            erros: errors,
            formState: makePartialPublicPost(formDataObj)
        }
    }

    const validPostData = zodParseObj.data;
    const newPost = {
        ...validPostData
    }

    let post;

    try {
        post = await postRepository.update(id, newPost)
    } catch (e: unknown) {
        if (e instanceof Error) {
            return {
                formState: makePartialPublicPost(formDataObj),
                erros: [e.message]
            }
        }

        return {
            formState: makePartialPublicPost(formDataObj),
            erros: ['Erro desconhecido']
        }
    }

    // @ts-ignore
    revalidateTag('posts')
    // @ts-ignore
    revalidateTag(`post-${post.slug}`)

    return {
        formState: makePublicPostFromDb(post),
        erros: [],
        success: `${Date.now()}`
    }
}