import { useState } from 'react'
import Landing from './pages/Landing'
import { Routes, Route } from "react-router-dom";
import Signup from './pages/auth/signup';

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path='/signup' element={<Signup/>}/>

      </Routes>
    </>
  )
}

export default App
