import { useSyncExternalStore } from 'react'
import { getClientStore } from './clientStore'

export function useAppStore() {
  const store = getClientStore()
  const state = useSyncExternalStore(
    (onStoreChange) => store.subscribe(onStoreChange),
    () => store.getState(),
    () => store.getState(),
  )
  return { store, state }
}
