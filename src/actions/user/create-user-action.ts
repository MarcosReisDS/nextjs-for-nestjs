'use server';

import { CreateUserSchema, PublicUserDto, PublicUserSchema } from "@/lib/user/schemas";
import { getZodErrorMessage } from "@/utils/get-zod-error-messages";

type CreateUserActionState = {
    user: PublicUserDto;
    errors: string[];
    success: boolean
}

export async function createUserAction(
    state: CreateUserActionState,
    formData: FormData
): Promise<CreateUserActionState> {
    if (!(formData instanceof FormData)) {
        return {
            user: state.user,
            errors: ['Dados inválidos'],
            success: false
        }
    }

    const formObj = Object.fromEntries(formData.entries())
    const ParsedFormData = CreateUserSchema.safeParse(formObj)

    if (!ParsedFormData.success) {
        return {
            user: PublicUserSchema.parse(formObj),
            errors: getZodErrorMessage(ParsedFormData.error.format()),
            success: false
        }
    }

    return {
        user: state.user,
        errors: [],
        success: true
    }
}