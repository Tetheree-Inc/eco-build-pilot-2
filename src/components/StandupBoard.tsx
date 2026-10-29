import { useAppStore } from '../store/useAppStore'
import { MemberAvatar } from './MemberAvatar'

export function StandupBoard() {
  const { store, state } = useAppStore()

  return (
    <section className="panel" aria-labelledby="board-heading">
      <header className="panel-header">
        <div>
          <h2 id="board-heading">Standup board</h2>
          <p className="muted">
            Columns follow team member order. Changes appear here immediately and
            after reload once saved to the client store.
          </p>
        </div>
      </header>

      {state.members.length === 0 ? (
        <p className="empty-state">
          Add team members to see their standup columns on the board.
        </p>
      ) : (
        <div className="board-grid">
          {state.members.map((member) => (
            <article key={member.id} className="board-column">
              <header className="board-column-header">
                <MemberAvatar member={member} size={32} />
                <div>
                  <h3>{member.displayName}</h3>
                  <span className="muted">{member.role}</span>
                </div>
              </header>
              <label className="sr-only" htmlFor={`note-${member.id}`}>
                Standup update for {member.displayName}
              </label>
              <textarea
                id={`note-${member.id}`}
                className="standup-input"
                placeholder="Yesterday / today / blockers…"
                value={store.getStandupNote(member.id)}
                onChange={(e) => store.setStandupNote(member.id, e.target.value)}
                rows={5}
              />
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
