// PlayerMovementService.ts
const directionMap = {
  'w': 'UP',
  'a': 'LEFT',
  's': 'DOWN',
  'd': 'RIGHT',
};

export const movePlayer = (stompClient, playerName, keysPressed, interactionInProgress, roomCode) => {
  if (!stompClient || !playerName) return;

  const handleKeyPress = (e: KeyboardEvent) => {
    const inputElements = ['input', 'textarea', 'select'];
    const isInputElement = inputElements.includes((e.target as HTMLElement).tagName.toLowerCase());

    if (isInputElement) {
      return;
    }

    keysPressed.current[e.key] = true;
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    keysPressed.current[e.key] = false;
  };

  window.addEventListener('keydown', handleKeyPress);
  window.addEventListener('keyup', handleKeyUp);

  const handleMovement = () => {
    if (interactionInProgress) {
      // If interaction is in progress, do nothing
      return;
    }

    const directions = ['w', 'a', 's', 'd'];
    const pressedKeys = directions.filter(direction => keysPressed.current[direction]);

    if (pressedKeys.length > 0) {
      const directionsToSend = pressedKeys.map(key => directionMap[key]);
      stompClient.send(`/app/move/${roomCode}`, {}, JSON.stringify({ playerName: playerName, directions: directionsToSend, roomCode: roomCode }));
    } else {
      stompClient.send(`/app/move/${roomCode}`, {}, JSON.stringify({ playerName: playerName, directions: [], roomCode: roomCode  }));
    }
  };

  const movementInterval = setInterval(handleMovement, 30);

  return () => {
    window.removeEventListener('keydown', handleKeyPress);
    window.removeEventListener('keyup', handleKeyUp);
    clearInterval(movementInterval);
  };
};
