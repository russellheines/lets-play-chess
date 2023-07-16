import React, { useState, useEffect } from 'react';

import { Modal } from 'bootstrap';

import { ReactComponent as WhiteKing } from '../assets/lichess/wK.svg';
import { ReactComponent as BlackKing } from '../assets/lichess/bK.svg';
import { ReactComponent as WhiteBlackKing } from '../assets/lichess/wbK.svg';

/**
 * 
 * References:
 * 
 * - https://getbootstrap.com/docs/5.3/utilities/flex/
 * - https://getbootstrap.com/docs/5.3/components/modal/
 * - https://getbootstrap.com/docs/5.3/forms/
 * - https://www.w3schools.com/react/react_forms.asp
 * - https://stackoverflow.com/questions/66541564/how-to-hide-bootstrap-5-modal-only-on-success
 * 
 */
function PlayModal(props) {

	const [challengeKey, setChallengeKey] = useState("");
	
	useEffect(() => {
		const playModalEl = document.getElementById("playModal");
		const playModal = Modal.getOrCreateInstance(playModalEl);
		if (props.chooseSide || props.youWon || props.youLost || props.waitingForAccept) {
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
		//alert(`The namee you entered was: ${challengeKey}`);
	}

	let title = "Let's Play!";
	if (props.youWon) {
		title = "You won!";
	}
	else if (props.youLost) {
		title = "You lost!";
	}
	else if (props.waitingForAccept) {
		title = "Waiting!";
	}

	let instructions = "Choose a side:";
	if (props.numberOfPlayers === 2) {
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
										{props.numberOfPlayers === 1 ?
											<BlackKing onClick={() => props.handlePlayAs(1)} data-bs-dismiss="modal"/> :
											<BlackKing onClick={() => props.handleChallenge(1)}/>
										}
									</div>
									<div className="modalSquare">
										{props.numberOfPlayers === 1 ?
											<WhiteBlackKing onClick={() => props.handlePlayAs(Math.floor(Math.random() * 2))} data-bs-dismiss="modal"/> :
											<WhiteBlackKing onClick={() => props.handleChallenge(Math.floor(Math.random() * 2))}/>
										}
									</div>
									<div className="modalSquare">
										{props.numberOfPlayers === 1 ?
											<WhiteKing onClick={() => props.handlePlayAs(0)} data-bs-dismiss="modal"/> :
											<WhiteKing onClick={() => props.handleChallenge(0)}/>
										}
									</div>
								</div>
							<p />
							{props.numberOfPlayers === 2 &&
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
											value={props.gameId != null ? props.gameId : challengeKey}
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