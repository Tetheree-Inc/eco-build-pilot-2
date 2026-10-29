import { beforeEach, describe, expect, it } from 'vitest'
import { MAX_TEAM_MEMBERS } from '../domain/teamMember'
import { ClientStore, resetClientStoreForTests } from './clientStore'

describe('ClientStore team members', () => {
  beforeEach(() => {
    resetClientStoreForTests()
  })

  it('adds and updates members', () => {
    const store = new ClientStore()
    const added = store.addMember({
      displayName: 'Jamie',
      role: 'Team Lead',
    })
    expect(added.ok).toBe(true)
    expect(store.getState().members).toHaveLength(1)
    expect(store.getState().members[0].displayName).toBe('Jamie')

    const id = store.getState().members[0].id
    store.updateMember(id, { displayName: 'Jordan', role: 'QA' })
    expect(store.getState().members[0].displayName).toBe('Jordan')
    expect(store.getState().members[0].role).toBe('QA')
  })

  it('blocks adding beyond the limit', () => {
    const store = new ClientStore()
    for (let i = 0; i < MAX_TEAM_MEMBERS; i++) {
      store.addMember({ displayName: `Person ${i}`, role: 'Developer' })
    }
    const blocked = store.addMember({ displayName: 'One too many', role: 'Developer' })
    expect(blocked.ok).toBe(false)
    if (!blocked.ok) expect(blocked.reason).toBe('limit')
  })

  it('requires confirmation path when standup data exists', () => {
    const store = new ClientStore()
    store.addMember({ displayName: 'Sam', role: 'Developer' })
    const id = store.getState().members[0].id
    store.setStandupNote(id, 'Working on API')

    const blocked = store.removeMember(id)
    expect(blocked.ok).toBe(false)

    const removed = store.removeMember(id, { cascadeStandup: true })
    expect(removed.ok).toBe(true)
    expect(store.getState().members).toHaveLength(0)
    expect(store.getState().standupNotes).toHaveLength(0)
  })

  it('persists to localStorage on change', () => {
    const store = new ClientStore()
    store.addMember({ displayName: 'Alex', role: 'Designer' })
    const reloaded = new ClientStore()
    reloaded.replaceState(JSON.parse(localStorage.getItem('eco-build-pilot-2-app-state')!))
    expect(reloaded.getState().members[0].displayName).toBe('Alex')
  })
})
