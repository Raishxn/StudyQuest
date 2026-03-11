export function getDefaultAvatar(userId: string | undefined): string {
    if (!userId) return '/assets/avatars/avatar-4.png'; // Fallback neutral silhueta
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = (Math.abs(hash) % 4) + 1;
    return `/assets/avatars/avatar-${index}.png`;
}
