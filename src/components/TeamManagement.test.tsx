import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { MAX_TEAM_MEMBERS } from '../domain/teamMember'
import { resetClientStoreForTests } from '../store/clientStore'
import { TeamManagement } from './TeamManagement'

describe('TeamManagement UI', () => {
  beforeEach(() => {
    cleanup()
    resetClientStoreForTests()
  })

  it('adds a member from the form', async () => {
    const user = userEvent.setup()
    render(<TeamManagement />)

    await user.type(screen.getByPlaceholderText('Alex Morgan'), 'Taylor')
    await user.click(screen.getByRole('button', { name: 'Add member' }))

    expect(screen.getByText('Taylor')).toBeInTheDocument()
  })

  it('shows limit message at 15 members', async () => {
    const store = resetClientStoreForTests()
    for (let i = 0; i < MAX_TEAM_MEMBERS; i++) {
      store.addMember({ displayName: `M${i}`, role: 'Developer' })
    }

    render(<TeamManagement />)
    expect(screen.getByRole('status')).toHaveTextContent(/Member limit reached/)
    expect(screen.getByRole('button', { name: 'Add member' })).toBeDisabled()
  })
})
