import { Route, Routes } from 'react-router-dom'
import { HomePage } from '@/pages/home/home-page'
import { PlayerPage } from '@/pages/player/player-page'

export function App() {
  return (
    <Routes>
      <Route element={<HomePage />} path="/" />
      <Route element={<PlayerPage />} path="/players/:nickname" />
    </Routes>
  )
}
