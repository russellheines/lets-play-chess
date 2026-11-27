import { chooseComputerMove } from './computerPlayer';

self.onmessage = (event) => {
  const { requestId, fen } = event.data;
  const move = chooseComputerMove(fen);
  self.postMessage({ requestId, move });
};