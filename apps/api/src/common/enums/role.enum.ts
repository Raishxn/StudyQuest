export enum Role {
    USER = 'USER',
    VERIFIED = 'VERIFIED',
    SUPPORT = 'SUPPORT',
    MOD_JUNIOR = 'MOD_JUNIOR',
    MOD_SENIOR = 'MOD_SENIOR',
    ADMIN = 'ADMIN',
    OWNER = 'OWNER',
    BANNED = 'BANNED',
}

// Hierarquia numérica (útil para comparações "cargo mínimo")
export const ROLE_HIERARCHY: Record<Role, number> = {
    [Role.BANNED]: -1,
    [Role.USER]: 0,
    [Role.VERIFIED]: 1,
    [Role.SUPPORT]: 2,
    [Role.MOD_JUNIOR]: 3,
    [Role.MOD_SENIOR]: 4,
    [Role.ADMIN]: 5,
    [Role.OWNER]: 6,
};

export function hasMinRole(userRole: Role, minRole: Role): boolean {
    if (!userRole || !minRole) return false;

    if (userRole === Role.BANNED) return false;
    if (minRole === Role.BANNED) return true; // Anyone not banned can access a banned limit? (Just in case, though it doesn't make sense logically it's safe)

    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}
