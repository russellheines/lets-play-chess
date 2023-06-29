import React, { useEffect, useState } from 'react';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import OnePlayer from "./components/OnePlayer";
import TwoPlayers from "./components/TwoPlayers";
import Practice from "./components/Practice";

function App() {

	const [name, setName] = useState(undefined);

  useEffect(() => {
    isAuthenticated();
  }, []);

  function isAuthenticated() {
    //fetch('http://localhost:3001/isAuthenticated', {
    fetch('/isAuthenticated', {
      credentials: "include",
    })
    .then(res => res.json())
    .then(data => {
      setName(data.name ? data.name : null);
    });
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout name={name}/>}>
          <Route index element={<OnePlayer />} />
          <Route path="onePlayer" element={<OnePlayer/>} />
          <Route path="twoPlayers" element={<TwoPlayers/>} />
          <Route path="practice" element={<Practice/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;