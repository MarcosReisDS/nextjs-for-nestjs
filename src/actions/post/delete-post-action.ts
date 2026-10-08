'use server';

import { getLoginSessionFromApi } from "@/lib/login/manage-login";
import { PublicePostForApiDto } from "@/lib/post/schemas";
import { authenticatedApiRequest } from "@/utils/authenticated-api-request";
import { revalidateTag } from "next/cache";

export async function deletePostAction(id: string) {
    const isAuthenticated = await getLoginSessionFromApi();

    if (!isAuthenticated) {
        return {
            error: 'Faça login novamente em outra aba.'
        };
    }

    if (!id || typeof id !== 'string') {
        return {
            error: 'Dados inválidos',
        }
    }

    const postResponse = await authenticatedApiRequest<PublicePostForApiDto>(
        `/post/me/${id}`,
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )

    if (!postResponse.success) {
        return {
            error: 'Erro ao encontrar post'
        }
    }

    const deletePostResponse = await authenticatedApiRequest<PublicePostForApiDto>(
        `/post/me/${id}`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )

    if (!deletePostResponse.success) {
        return {
            error: 'Erro ao apagar post'
        }
    }


    // @ts-ignore
    revalidateTag('posts')
    // @ts-ignore
    revalidateTag(`post-${postResponse.data.slug}`)

    return {
        error: '',
    }
}