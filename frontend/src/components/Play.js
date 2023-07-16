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
					portrait={true}
					moves={props.moves}
					time={props.time}
					handleClickMove={props.handleClickMove}
					handleChangeOrientation={props.handleChangeOrientation}
					handleNewGame={props.handleNewGame}
				/>
				<Captured
					fen={props.time >= 0 ? props.fen[props.time] : []}
					color={props.orientation === 1 ? "w" : "b"}
				/>
				<Board
					fen={props.fen[props.time]}
					orientation={props.orientation}
					selected={props.selected}
					lastFrom={props.lastFrom[props.time]}
					lastTo={props.lastTo[props.time]}
					handleClickSquare={props.handleClickSquare}
					inCheck={props.inCheck[props.time]}
				/>
				<Controls
					handleChangeOrientation={props.handleChangeOrientation}
					handleNewGame={props.handleNewGame}
				/>
				<Captured
					fen={props.time >= 0 ? props.fen[props.time] : []}
					color={props.orientation === 0 ? "w" : "b"}
				/>
			</div>
			}
			{!isPortrait &&
			<div className="landscape">
				<Board
					fen={props.state.fen[props.state.time]}
					orientation={props.state.orientation}
					selected={props.state.selected}
					lastFrom={props.state.lastFrom[props.state.time]}
					lastTo={props.state.lastTo[props.state.time]}
					handleClickSquare={props.handleClickSquare}
					inCheck={props.state.inCheck[props.state.time]}
					dispatch={props.dispatch}
				/>
				<div className="panel">
					<Captured
						fen={props.state.time >= 0 ? props.state.fen[props.state.time] : []}
						color={props.state.orientation === 1 ? "w" : "b"}
					/>
					<div className="box-shadow">
						<History
							moves={props.state.moves}
							time={props.state.time}
							dispatch={props.dispatch}
							handleNewGame={props.handleNewGame}
						/>
						<Controls
							handleChangeOrientation={props.handleChangeOrientation}
							handleNewGame={props.handleNewGame}
							dispatch={props.dispatch}
						/>
					</div>
					<Captured
						fen={props.state.time >= 0 ? props.state.fen[props.state.time] : []}
						color={props.state.orientation === 0 ? "w" : "b"}
					/>
				</div>
			</div>
			}
			<PlayModal
				numberOfPlayers={props.state.numberOfPlayers}
				chooseSide={props.state.chooseSide}
				youWon={props.state.youWon}
				youLost={props.state.youLost}
				waitingForAccept={props.state.waitingForAccept}
				handlePlayAs={props.handlePlayAs}
				handleDismissModal={props.handleDismissModal}
				handleChallenge={props.handleChallenge}
				gameId={props.state.gameId}
				handleAccept={props.handleAccept}
			/>
		</>
  	);
};

export default Play;