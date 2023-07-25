import React from 'react';

import { useMediaQuery } from 'react-responsive'

import Board from "./Board";
import History from "./History";
import Controls from "./Controls";
import Captured from "./Captured";
import PlayModal from "./PlayModal";

function Play(props) {
  
	const isPortrait = useMediaQuery({ query: '(orientation: portrait)' })

	return (
		<>
			{isPortrait &&
			<div className="portrait">
				<History
					state={props.state}
					dispatch={props.dispatch}
					handleClickMove={props.handleClickMove}
					handleChangeOrientation={props.handleChangeOrientation}
					handleNewGame={props.handleNewGame}
				/>
				<div className='playerText'><span className="dot"></span>Anonymous</div>
				<Captured
					state={props.state}
					color={props.state.orientation === 1 ? "w" : "b"}
				/>
				<Board
					state={props.state}
					dispatch={props.dispatch}
					handleClickSquare={props.handleClickSquare}
				/>
				<Captured
					state={props.state}
					color={props.state.orientation === 0 ? "w" : "b"}
				/>
				<div className='playerText'><span className="dot"></span>Anonymous</div>
				<Controls
					dispatch={props.dispatch}
					handleChangeOrientation={props.handleChangeOrientation}
					handleNewGame={props.handleNewGame}
				/>
			</div>
			}
			{!isPortrait &&
			<div className="landscape">
				<Board
					state={props.state}
					dispatch={props.dispatch}
					handleClickSquare={props.handleClickSquare}
				/>
				<div className="panel">
					<Captured
						state={props.state}
						color={props.state.orientation === 1 ? "w" : "b"}
					/>
					<div className="box-shadow">
						<div className='playerText'><span className="dot"></span>Anonymous</div>
						<History
							state={props.state}
							dispatch={props.dispatch}
							handleNewGame={props.handleNewGame}
						/>
						<Controls
							dispatch={props.dispatch}
							handleChangeOrientation={props.handleChangeOrientation}
							handleNewGame={props.handleNewGame}
						/>
						<div className='playerText'><span className="dot"></span>Anonymous</div>
					</div>
					<Captured
						state={props.state}
						color={props.state.orientation === 0 ? "w" : "b"}
					/>
				</div>
			</div>
			}
			<PlayModal
				state={props.state}
				handlePlayAs={props.handlePlayAs}
				handleDismissModal={props.handleDismissModal}
				handleChallenge={props.handleChallenge}
				handleAccept={props.handleAccept}
			/>
		</>
  	);
};

export default Play;