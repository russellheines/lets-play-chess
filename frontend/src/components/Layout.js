import React from 'react';

import { Outlet, Link } from "react-router-dom";

import { ReactComponent as Github } from '../assets/github/github-mark.svg';

function Layout(props) {

  return (
    <>
      <nav className="navbar navbar-expand-lg border-bottom">
        <div className="container">
          <div className="navbar-brand">Let's Play Chess!</div>
          <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target=".navbar-collapse">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto">
              {/*
              <Link to="/practice" className="nav-link" >
                <li data-bs-toggle="collapse" data-bs-target=".navbar-collapse.show">
                  Practice
                </li>
              </Link>
              */}
              <li className="nav-item dropdown">
                <button className="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                  Play
                </button>
                <ul className="dropdown-menu">
                  <Link to="/play" className="nav-link" onClick={props.handleOnePlayer}>
                    <li className="dropdown-item" data-bs-toggle="collapse" data-bs-target=".navbar-collapse.show">One player</li>
                  </Link>
                  <Link to="/play" className="nav-link" onClick={props.handleTwoPlayers}>
                    <li className="dropdown-item" data-bs-toggle="collapse" data-bs-target=".navbar-collapse.show">Two players</li>
                  </Link>
                </ul>
              </li>
            </ul>
            <ul className='navbar-nav'>
              <div style={{ height: 24, width: 24 }}>
                <a href="http://www.github.com/russellheines/lets-play-chess/"><Github/></a>                
              </div>
            </ul>
          </div>
        </div>
      </nav>
      <Outlet/>
    </>
  );
}

export default Layout;