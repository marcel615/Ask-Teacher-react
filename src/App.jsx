import { useState } from 'react'
import Header from './component/Header'
import AppRouter from './routes/AppRouter'
import './App.css'

function App() {
  return (
    <div>
      <Header />
      <AppRouter />
    </div> 
  )
}


export default App
