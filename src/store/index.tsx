import React from 'react'
import { createStore, TStore } from './createStore'
import { useLocalStore } from 'mobx-react' // 6.x or mobx-react-lite@1.4.0

const storeContext = React.createContext<TStore | null>(null)

export const StoreProvider = ({ children }) => {
  const store = useLocalStore(createStore)
//   store.init();
  return <storeContext.Provider value={store}>{children}</storeContext.Provider>
}

export const useStore = (): TStore => {
  const store = React.useContext(storeContext)
  if (!store) {
    // this is especially useful in TypeScript so you don't need to be checking for null all the time
    throw new Error('useStore must be used within a StoreProvider.')
  }
  return store
}