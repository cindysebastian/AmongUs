import React from 'react';
import Interactible from './interfaces/Interactible';
import Player from './interfaces/Player';

interface Props {
    interactibles: Interactible[];
    currentPlayer: Player;
}

const TaskIcons: React.FC<Props> = ({ interactibles, currentPlayer }) => {
    return (
        <div style={{ position: 'fixed' }}>
            {interactibles.filter(interactible => interactible.assignedPlayer === currentPlayer.name).map(interactible => (
                <img
                    key={interactible.id}
                    src={`gameservice/src/main/resources/${interactible.type.toLowerCase()}${currentPlayer.canInteract ? 'red' : ''}.png`}
                    alt={interactible.type}
                    style={{
                        position: 'absolute',
                        top: interactible.position.y,
                        left: interactible.position.x,
                        width: '100px',
                        height: '100px',
                        zIndex: 6,
                    }}
                />
            ))}
        </div>
    );
};

export default TaskIcons;