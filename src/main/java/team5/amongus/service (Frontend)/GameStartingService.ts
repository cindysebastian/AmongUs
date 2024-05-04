export const startGame = (stompClient, setRedirectToSpaceShip)=>

{
    if (!stompClient) return;

    const subscription = stompClient.subscribe('/topic/gameStart', () => {
        // When the game starts, redirect all players to the spaceship
        setRedirectToSpaceShip(true);
    });

    return () => {
        // TODO: Cindy this is your problem now
        stompClient;
        setRedirectToSpaceShip;
    };
};