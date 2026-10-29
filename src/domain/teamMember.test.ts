import { describe, expect, it } from 'vitest'
import {
  MAX_TEAM_MEMBERS,
  canAddMember,
  moveMember,
  reorderMembers,
} from './teamMember'
import type { TeamMember } from './teamMember'

const sample = (id: string, name: string): TeamMember => ({
  id,
  displayName: name,
  role: 'Developer',
  avatarColour: '#2563eb',
})

describe('teamMember domain', () => {
  it('enforces max member count', () => {
    expect(canAddMember(MAX_TEAM_MEMBERS - 1)).toBe(true)
    expect(canAddMember(MAX_TEAM_MEMBERS)).toBe(false)
  })

  it('reorders members', () => {
    const members = [sample('a', 'A'), sample('b', 'B'), sample('c', 'C')]
    const next = reorderMembers(members, 0, 2)
    expect(next.map((m) => m.id)).toEqual(['b', 'c', 'a'])
  })

  it('moves member up and down', () => {
    const members = [sample('a', 'A'), sample('b', 'B')]
    expect(moveMember(members, 'b', 'up').map((m) => m.id)).toEqual(['b', 'a'])
    expect(moveMember(members, 'a', 'down').map((m) => m.id)).toEqual(['b', 'a'])
  })
})
