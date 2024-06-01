export const subscribeToGameStatus = (stompClient, setRedirectToSpaceShip, roomCode) => {
    console.log(roomCode)
    if (!stompClient && !roomCode) return;

    const subscription = stompClient.subscribe(`/topic/gameStart/${roomCode}`, () => {

        setRedirectToSpaceShip(true);
    });

    return () => {
        // TODO: Cindy this is your problem now
        stompClient;
        setRedirectToSpaceShip;
    };
};