interface AvatarProps {
    name: string;
    src?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className={`avatar avatar-${size} ${className}`}>
            {src ? (
                <img src={src} alt={name} />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
}
