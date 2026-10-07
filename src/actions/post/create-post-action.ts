'use server';

import { makePartialPublicPost, PublicPost } from "@/dto/post/dto";
import { verifyLoginSession } from "@/lib/login/manage-login";
import { PostCreateSchema } from "@/lib/post/schemas";
import { PostModel } from "@/models/post/post-model";
import { postRepository } from "@/repositories/post";
import { getZodErrorMessage } from "@/utils/get-zod-error-messages";
import { makeSlugFromText } from "@/utils/make-slug-from-text";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid"

type CreatePostActionState = {
    formState: PublicPost;
    erros: string[];
    success?: string;
}

export async function createPostAction(
    prevState: CreatePostActionState,
    formData: FormData,
): Promise<CreatePostActionState> {
    const isAuthenticated = await verifyLoginSession();

    if (!(formData instanceof FormData)) {
        return {
            formState: prevState.formState,
            erros: ['Dados inválidos']
        }
    }

    const formDataObj = Object.fromEntries(formData.entries());
    const zodParseObj = PostCreateSchema.safeParse(formDataObj)

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
    const newPost: PostModel = {
        ...validPostData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: uuidv4(),
        slug: makeSlugFromText(validPostData.title)
    }

    try {
        await postRepository.create(newPost)
    } catch (e: unknown) {
        if (e instanceof Error) {
            return {
                formState: newPost,
                erros: [e.message]
            }
        }

        return {
            formState: newPost,
            erros: ['Erro desconhecido']
        }
    }

    // @ts-ignore
    revalidateTag('posts')
    redirect(`/admin/post/${newPost.id}?created=1`)
}