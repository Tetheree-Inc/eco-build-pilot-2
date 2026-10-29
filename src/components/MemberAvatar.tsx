import type { TeamMember } from '../domain/teamMember'

interface MemberAvatarProps {
  member: Pick<TeamMember, 'displayName' | 'avatarColour'>
  size?: number
}

export function MemberAvatar({ member, size = 36 }: MemberAvatarProps) {
  const initials = member.displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <span
      className="member-avatar"
      style={{
        width: size,
        height: size,
        backgroundColor: member.avatarColour,
        fontSize: size * 0.38,
      }}
      aria-hidden
    >
      {initials || '?'}
    </span>
  )
}
