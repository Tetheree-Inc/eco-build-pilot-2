import {
  canAddMember,
  createMemberId,
  defaultAvatarColour,
  moveMember,
  normalizeDisplayName,
  reorderMembers,
  type AvatarColour,
  type MemberRole,
  type StandupNote,
  type TeamMember,
} from '../domain/teamMember'

export const STORAGE_KEY = 'eco-build-pilot-2-app-state'
export const STORE_VERSION = 1

export interface AppState {
  version: number
  members: TeamMember[]
  standupNotes: StandupNote[]
}

export type AppStoreListener = () => void

function emptyState(): AppState {
  return { version: STORE_VERSION, members: [], standupNotes: [] }
}

export class ClientStore {
  private state: AppState
  private listeners = new Set<AppStoreListener>()

  constructor(initial?: AppState) {
    this.state = initial ?? emptyState()
  }

  subscribe(listener: AppStoreListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getState(): AppState {
    return this.state
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener()
    }
    persistState(this.state)
  }

  private setState(next: AppState): void {
    this.state = next
    this.emit()
  }

  replaceState(next: AppState): void {
    this.state = next
    for (const listener of this.listeners) {
      listener()
    }
  }

  addMember(input: {
    displayName: string
    role: MemberRole
    avatarColour?: AvatarColour
  }): { ok: true; member: TeamMember } | { ok: false; reason: 'limit' | 'empty_name' } {
    const displayName = normalizeDisplayName(input.displayName)
    if (!displayName) {
      return { ok: false, reason: 'empty_name' }
    }
    if (!canAddMember(this.state.members.length)) {
      return { ok: false, reason: 'limit' }
    }
    const member: TeamMember = {
      id: createMemberId(),
      displayName,
      role: input.role,
      avatarColour:
        input.avatarColour ?? defaultAvatarColour(this.state.members.length),
    }
    this.setState({
      ...this.state,
      members: [...this.state.members, member],
    })
    return { ok: true, member }
  }

  updateMember(
    memberId: string,
    patch: Partial<Pick<TeamMember, 'displayName' | 'role' | 'avatarColour'>>,
  ): { ok: true } | { ok: false; reason: 'not_found' | 'empty_name' } {
    const index = this.state.members.findIndex((m) => m.id === memberId)
    if (index === -1) return { ok: false, reason: 'not_found' }
    const current = this.state.members[index]
    const displayName =
      patch.displayName !== undefined
        ? normalizeDisplayName(patch.displayName)
        : current.displayName
    if (!displayName) return { ok: false, reason: 'empty_name' }
    const updated: TeamMember = {
      ...current,
      ...patch,
      displayName,
    }
    const members = [...this.state.members]
    members[index] = updated
    this.setState({ ...this.state, members })
    return { ok: true }
  }

  reorderMembers(fromIndex: number, toIndex: number): void {
    this.setState({
      ...this.state,
      members: reorderMembers(this.state.members, fromIndex, toIndex),
    })
  }

  moveMember(memberId: string, direction: 'up' | 'down'): void {
    this.setState({
      ...this.state,
      members: moveMember(this.state.members, memberId, direction),
    })
  }

  memberHasStandupData(memberId: string): boolean {
    return this.state.standupNotes.some(
      (n) => n.memberId === memberId && n.text.trim().length > 0,
    )
  }

  removeMember(memberId: string, options?: { cascadeStandup?: boolean }):
    | { ok: true }
    | { ok: false; reason: 'not_found' | 'has_standup_data' } {
    const index = this.state.members.findIndex((m) => m.id === memberId)
    if (index === -1) return { ok: false, reason: 'not_found' }
    const hasData = this.memberHasStandupData(memberId)
    if (hasData && !options?.cascadeStandup) {
      return { ok: false, reason: 'has_standup_data' }
    }
    const members = this.state.members.filter((m) => m.id !== memberId)
    const standupNotes = options?.cascadeStandup
      ? this.state.standupNotes.filter((n) => n.memberId !== memberId)
      : this.state.standupNotes
    this.setState({ ...this.state, members, standupNotes })
    return { ok: true }
  }

  setStandupNote(memberId: string, text: string): void {
    const trimmed = text
    const existing = this.state.standupNotes.find((n) => n.memberId === memberId)
    let standupNotes: StandupNote[]
    if (!trimmed.trim()) {
      standupNotes = this.state.standupNotes.filter((n) => n.memberId !== memberId)
    } else if (existing) {
      standupNotes = this.state.standupNotes.map((n) =>
        n.memberId === memberId
          ? { ...n, text: trimmed, updatedAt: new Date().toISOString() }
          : n,
      )
    } else {
      standupNotes = [
        ...this.state.standupNotes,
        {
          memberId,
          text: trimmed,
          updatedAt: new Date().toISOString(),
        },
      ]
    }
    this.setState({ ...this.state, standupNotes })
  }

  getStandupNote(memberId: string): string {
    return (
      this.state.standupNotes.find((n) => n.memberId === memberId)?.text ?? ''
    )
  }
}

export function loadPersistedState(): AppState | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AppState
    if (!parsed || parsed.version !== STORE_VERSION) return null
    if (!Array.isArray(parsed.members) || !Array.isArray(parsed.standupNotes)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function persistState(state: AppState): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota errors in-session
  }
}

let singleton: ClientStore | null = null

export function getClientStore(): ClientStore {
  if (!singleton) {
    singleton = new ClientStore(loadPersistedState() ?? undefined)
  }
  return singleton
}

/** Test-only reset */
export function resetClientStoreForTests(initial?: AppState): ClientStore {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
  singleton = new ClientStore(initial)
  return singleton
}
