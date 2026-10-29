import { useState } from 'react'
import { StandupBoard } from './components/StandupBoard'
import { TeamManagement } from './components/TeamManagement'
import './App.css'

type Tab = 'board' | 'team'

export default function App() {
  const [tab, setTab] = useState<Tab>('team')

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">ECO Build Pilot 2</p>
          <h1>Team standup</h1>
        </div>
        <nav className="tabs" aria-label="Main">
          <button
            type="button"
            className={tab === 'board' ? 'active' : ''}
            aria-current={tab === 'board' ? 'page' : undefined}
            onClick={() => setTab('board')}
          >
            Board
          </button>
          <button
            type="button"
            className={tab === 'team' ? 'active' : ''}
            aria-current={tab === 'team' ? 'page' : undefined}
            onClick={() => setTab('team')}
          >
            Team
          </button>
        </nav>
      </header>

      <main>{tab === 'board' ? <StandupBoard /> : <TeamManagement />}</main>

      <footer className="app-footer">
        <span>v{__APP_VERSION__}</span>
      </footer>
    </div>
  )
}
