export const MAX_TEAM_MEMBERS = 15

export const MEMBER_ROLES = [
  'Team Lead',
  'Developer',
  'Designer',
  'QA',
  'Product',
  'Other',
] as const

export type MemberRole = (typeof MEMBER_ROLES)[number]

export const AVATAR_COLOURS = [
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#ea580c',
  '#16a34a',
  '#0891b2',
  '#ca8a04',
  '#64748b',
  '#be123c',
  '#0d9488',
] as const

export type AvatarColour = (typeof AVATAR_COLOURS)[number]

export interface TeamMember {
  id: string
  displayName: string
  role: MemberRole
  avatarColour: AvatarColour
}

export interface StandupNote {
  memberId: string
  text: string
  updatedAt: string
}

export function createMemberId(): string {
  return crypto.randomUUID()
}

export function defaultAvatarColour(index: number): AvatarColour {
  return AVATAR_COLOURS[index % AVATAR_COLOURS.length]
}

export function normalizeDisplayName(name: string): string {
  return name.trim()
}

export function canAddMember(currentCount: number): boolean {
  return currentCount < MAX_TEAM_MEMBERS
}

export function reorderMembers(
  members: TeamMember[],
  fromIndex: number,
  toIndex: number,
): TeamMember[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= members.length ||
    toIndex >= members.length ||
    fromIndex === toIndex
  ) {
    return members
  }
  const next = [...members]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

export function moveMember(
  members: TeamMember[],
  memberId: string,
  direction: 'up' | 'down',
): TeamMember[] {
  const index = members.findIndex((m) => m.id === memberId)
  if (index === -1) return members
  const target = direction === 'up' ? index - 1 : index + 1
  return reorderMembers(members, index, target)
}
