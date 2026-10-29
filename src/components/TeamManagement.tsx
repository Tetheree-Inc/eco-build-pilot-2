import { useState, type DragEvent, type FormEvent } from 'react'
import {
  AVATAR_COLOURS,
  MAX_TEAM_MEMBERS,
  MEMBER_ROLES,
  type AvatarColour,
  type MemberRole,
  type TeamMember,
} from '../domain/teamMember'
import { useAppStore } from '../store/useAppStore'
import { MemberAvatar } from './MemberAvatar'

export function TeamManagement() {
  const { store, state } = useAppStore()
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<MemberRole>('Developer')
  const [newColour, setNewColour] = useState<AvatarColour>(AVATAR_COLOURS[0])
  const [addError, setAddError] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pendingRemove, setPendingRemove] = useState<TeamMember | null>(null)

  const atLimit = state.members.length >= MAX_TEAM_MEMBERS

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    setAddError(null)
    const result = store.addMember({
      displayName: newName,
      role: newRole,
      avatarColour: newColour,
    })
    if (!result.ok) {
      setAddError(
        result.reason === 'limit'
          ? `Maximum of ${MAX_TEAM_MEMBERS} team members reached.`
          : 'Display name is required.',
      )
      return
    }
    setNewName('')
    setNewColour(AVATAR_COLOURS[state.members.length % AVATAR_COLOURS.length])
  }

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    store.reorderMembers(dragIndex, index)
    setDragIndex(index)
  }

  function handleDragEnd() {
    setDragIndex(null)
  }

  function requestRemove(member: TeamMember) {
    if (store.memberHasStandupData(member.id)) {
      setPendingRemove(member)
      return
    }
    store.removeMember(member.id, { cascadeStandup: true })
  }

  function confirmRemove() {
    if (!pendingRemove) return
    store.removeMember(pendingRemove.id, { cascadeStandup: true })
    setPendingRemove(null)
    if (editingId === pendingRemove.id) setEditingId(null)
  }

  return (
    <section className="panel" aria-labelledby="team-heading">
      <header className="panel-header">
        <div>
          <h2 id="team-heading">Team members</h2>
          <p className="muted">
            Add, rename, reorder, and remove members. Up to {MAX_TEAM_MEMBERS}{' '}
            members ({state.members.length}/{MAX_TEAM_MEMBERS}).
          </p>
        </div>
      </header>

      <form className="add-member-form" onSubmit={handleAdd}>
        <label>
          Display name
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Alex Morgan"
            disabled={atLimit}
            maxLength={80}
          />
        </label>
        <label>
          Role
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as MemberRole)}
            disabled={atLimit}
          >
            {MEMBER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
        <label>
          Avatar colour
          <ColourPicker
            value={newColour}
            onChange={setNewColour}
            disabled={atLimit}
          />
        </label>
        <button type="submit" disabled={atLimit}>
          Add member
        </button>
      </form>
      {addError && (
        <p className="form-error" role="alert">
          {addError}
        </p>
      )}
      {atLimit && (
        <p className="form-hint" role="status">
          Member limit reached. Remove someone before adding another.
        </p>
      )}

      {state.members.length === 0 ? (
        <p className="empty-state">No team members yet. Add your first member above.</p>
      ) : (
        <ul className="member-list">
          {state.members.map((member, index) => (
            <li
              key={member.id}
              className={`member-row${dragIndex === index ? ' dragging' : ''}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              {editingId === member.id ? (
                <MemberEditor
                  member={member}
                  onSave={(patch) => {
                    const result = store.updateMember(member.id, patch)
                    if (result.ok) setEditingId(null)
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <span className="drag-handle" aria-hidden>
                    ⋮⋮
                  </span>
                  <MemberAvatar member={member} />
                  <div className="member-summary">
                    <strong>{member.displayName}</strong>
                    <span className="muted">{member.role}</span>
                  </div>
                  <div className="member-actions">
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Move ${member.displayName} up`}
                      disabled={index === 0}
                      onClick={() => store.moveMember(member.id, 'up')}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Move ${member.displayName} down`}
                      disabled={index === state.members.length - 1}
                      onClick={() => store.moveMember(member.id, 'down')}
                    >
                      ↓
                    </button>
                    <button type="button" onClick={() => setEditingId(member.id)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => requestRemove(member)}
                    >
                      Remove
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {pendingRemove && (
        <div className="modal-backdrop" role="presentation">
          <div
            className="modal"
            role="alertdialog"
            aria-labelledby="remove-title"
            aria-describedby="remove-desc"
          >
            <h3 id="remove-title">Remove {pendingRemove.displayName}?</h3>
            <p id="remove-desc">
              This member has standup notes on the board. Removing them will
              permanently delete those notes. This cannot be undone.
            </p>
            <div className="modal-actions">
              <button type="button" onClick={() => setPendingRemove(null)}>
                Cancel
              </button>
              <button type="button" className="danger" onClick={confirmRemove}>
                Remove and delete notes
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function ColourPicker({
  value,
  onChange,
  disabled,
}: {
  value: AvatarColour
  onChange: (c: AvatarColour) => void
  disabled?: boolean
}) {
  return (
    <div className="colour-picker" role="group" aria-label="Avatar colour">
      {AVATAR_COLOURS.map((colour) => (
        <button
          key={colour}
          type="button"
          className={`colour-swatch${value === colour ? ' selected' : ''}`}
          style={{ backgroundColor: colour }}
          aria-label={colour}
          aria-pressed={value === colour}
          disabled={disabled}
          onClick={() => onChange(colour)}
        />
      ))}
    </div>
  )
}

function MemberEditor({
  member,
  onSave,
  onCancel,
}: {
  member: TeamMember
  onSave: (patch: Partial<TeamMember>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(member.displayName)
  const [role, setRole] = useState(member.role)
  const [colour, setColour] = useState(member.avatarColour)

  return (
    <div className="member-editor">
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
      </label>
      <label>
        Role
        <select value={role} onChange={(e) => setRole(e.target.value as MemberRole)}>
          {MEMBER_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <label>
        Colour
        <ColourPicker value={colour} onChange={setColour} />
      </label>
      <div className="member-actions">
        <button
          type="button"
          onClick={() =>
            onSave({ displayName: name, role, avatarColour: colour })
          }
        >
          Save
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
