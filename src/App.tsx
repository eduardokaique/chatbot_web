import { useContext } from 'react'
import styles from  './App.module.scss'
import { Chat } from './components/Chat'
import { AuthContext } from './contexts/auth'
export function App() {
//const { user }  = useContext(AuthContext)

  return (
    <main className={styles.contentWrapper}>
      <Chat />
    </main>
  )
}
