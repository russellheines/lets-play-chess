import React from 'react';

import LogoutIcon from '@mui/icons-material/Logout';

import { Outlet, Link } from "react-router-dom";

/**
 * Based on examples from https://getbootstrap.com/docs/5.3/components/navbar/.
 * 
 * NOTE: data-bs-toggle="collapse" data-bs-target=".navbar-collapse.show" is used to re-collapse the navbar when an item is selected
 */
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
            <ul className="navbar-nav">
              {props.name === null ? (
                <li>
                  <a className="nav-link" href="/login/federated/google">Sign in with Google</a>
                </li>
              ) :
              (
                <li className="navbar-text">Signed in as {props.name}&nbsp;&nbsp;<a href="/logout"><LogoutIcon/></a></li>
              )}
            </ul>
          </div>
        </div>
      </nav>
      <Outlet/>
    </>
  );
}

export default Layout;