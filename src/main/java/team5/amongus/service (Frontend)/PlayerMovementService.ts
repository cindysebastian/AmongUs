// PlayerMovementService.ts
const directionMap = {
  'w': 'UP',
  'a': 'LEFT',
  's': 'DOWN',
  'd': 'RIGHT',
};

export const movePlayer = (stompClient, playerName, keysPressed) => {
  if (!stompClient || !playerName) return;

  const handleKeyPress = (e: KeyboardEvent) => {
    const inputElements = ['input', 'textarea', 'select'];
    const isInputElement = inputElements.includes((e.target as HTMLElement).tagName.toLowerCase());

    if (isInputElement) {
      return;
    }

    if (e.key === 'e') {
      // Interaction logic can go here
    }
    keysPressed.current[e.key] = true;
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    keysPressed.current[e.key] = false;
  };

  window.addEventListener('keydown', handleKeyPress);
  window.addEventListener('keyup', handleKeyUp);

  const handleMovement = () => {
    const directions = ['w', 'a', 's', 'd'];
    const pressedKeys = directions.filter(direction => keysPressed.current[direction]);
    if (pressedKeys.length > 0) {
      const directionsToSend = pressedKeys.map(key => directionMap[key]);
      stompClient.send('/app/move', {}, JSON.stringify({ playerName: playerName, directions: directionsToSend }));
      stompClient.send('/app/move/inGamePlayers', {}, JSON.stringify({ playerName: playerName, directions: directionsToSend }));
    } else {
      stompClient.send('/app/move', {}, JSON.stringify({ playerName: playerName, directions: [] }));
      stompClient.send('/app/move/inGamePlayers', {}, JSON.stringify({ playerName: playerName, directions: [] }));
    }
  };

  handleMovement();
  const movementInterval = setInterval(handleMovement, 100);

  return () => {
    window.removeEventListener('keydown', handleKeyPress);
    window.removeEventListener('keyup', handleKeyUp);
    clearInterval(movementInterval);
  };
};
