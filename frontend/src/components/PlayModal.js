import React, { useState, useEffect } from 'react';

import { Modal } from 'bootstrap';

import { ReactComponent as WhiteKing } from '../assets/lichess/wK.svg';
import { ReactComponent as BlackKing } from '../assets/lichess/bK.svg';
import { ReactComponent as WhiteBlackKing } from '../assets/lichess/wbK.svg';

function PlayModal(props) {

	const numberOfPlayers = props.state.numberOfPlayers;
	const chooseSide = props.state.chooseSide;
	const youWon = props.state.youWon;
	const youLost = props.state.youLost;
	const waitingForAccept = props.state.waitingForAccept;
	const challengeId = props.state.challengeId;
	
	const [challengeKey, setChallengeKey] = useState("");  // TODO: rename
	
	useEffect(() => {
		const playModalEl = document.getElementById("playModal");
		const playModal = Modal.getOrCreateInstance(playModalEl);
		if (chooseSide || youWon || youLost || waitingForAccept) {
			playModal.show();
			playModalEl.addEventListener("show.bs.modal", event => {
				setChallengeKey("");
			});
			playModalEl.addEventListener("hidden.bs.modal", event => {
				props.handleDismissModal();  // clears state if a user clicks the close button or outside of the modal (or enters a challenge key)
			});
		}
		else {
			playModal.hide();
		}
	}, [props]);

	const handleSubmit = (event) => {
		event.preventDefault();
		const playModalEl = document.getElementById("playModal");
		const playModal = Modal.getOrCreateInstance(playModalEl);
		playModal.hide();
		props.handleAccept(challengeKey);
	}

	let title = "Let's Play!";
	if (youWon) {
		title = "You won!";
	}
	else if (youLost) {
		title = "You lost!";
	}
	else if (waitingForAccept) {
		title = "Waiting!";
	}

	let instructions = "Choose a side:";
	if (numberOfPlayers === 2) {
		instructions = "To challenge a friend, first choose a side:";
	}

	return (
		<>
			<div className="modal" id="playModal" tabIndex="-1">
				<div className="modal-dialog modal-dialog-centered">
					<div className="modal-content">
						<div className="modal-header">
							<h1 className="modal-title fs-5">{title}</h1>
							<button type="button" className="btn-close" data-bs-dismiss="modal"></button>
						</div>
						<div className="modal-body">
							<p>{instructions}</p>
								<div className="d-flex justify-content-center">
									<div className="modalSquare">
										{numberOfPlayers === 1 ?
											<BlackKing onClick={() => props.handlePlayAs(1)} data-bs-dismiss="modal"/> :
											<BlackKing onClick={() => props.handleChallenge(1)}/>
										}
									</div>
									<div className="modalSquare">
										{numberOfPlayers === 1 ?
											<WhiteBlackKing onClick={() => props.handlePlayAs(Math.floor(Math.random() * 2))} data-bs-dismiss="modal"/> :
											<WhiteBlackKing onClick={() => props.handleChallenge(Math.floor(Math.random() * 2))}/>
										}
									</div>
									<div className="modalSquare">
										{numberOfPlayers === 1 ?
											<WhiteKing onClick={() => props.handlePlayAs(0)} data-bs-dismiss="modal"/> :
											<WhiteKing onClick={() => props.handleChallenge(0)}/>
										}
									</div>
								</div>
							<p />
							{numberOfPlayers === 2 &&
							<>
								<p>To accept a challenge:</p>
								<div className="row">
									<div className='col'/>
									<div className='col-8'>
									<form onSubmit={handleSubmit}>
										<input
          									type="text" 
											className="form-control"
											placeholder="Enter challenge key"
											autoComplete="off"
											value={challengeId != null ? challengeId : challengeKey}
											onChange={(e) => setChallengeKey(e.target.value)}
										/>									
									</form>
									</div>
									<div className='col'/>
								</div>
								<p />
							</>
							}
						</div>
					</div>
				</div>
			</div>		
		</>
	);
}

export default PlayModal;