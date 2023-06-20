import React from 'react';

import LogoutIcon from '@mui/icons-material/Logout';

import { Outlet, Link } from "react-router-dom";

function TopNavbar(props) {

/*
<Link to="/" className="nav-link">
<li data-bs-toggle="collapse" data-bs-target=".navbar-collapse.show">Practice</li>
</Link>
*/

//<a className="nav-link" href="http://localhost:3001/login/federated/google">Sign in with Google</a>
//<li className="navbar-text">Signed in as {props.name}&nbsp;&nbsp;<a href="http://localhost:3001/logout"><LogoutIcon/></a></li>

  return (
    <>
      <nav className="navbar navbar-expand-lg xbg-dark border-bottom xborder-bottom-dark" xdata-bs-theme="dark">
        <div className="container">
          <div className="navbar-brand">Let's Play Chess!</div>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target=".navbar-collapse">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto">
              <Link to="/play" className="nav-link" >
                <li data-bs-toggle="collapse" data-bs-target=".navbar-collapse.show">Play</li>
              </Link>
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


export default TopNavbar;