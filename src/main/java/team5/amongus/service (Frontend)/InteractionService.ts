export const handleReceivedInteractibles = (interactiblesData, setInteractibles) => {
  const parsedInteractibles = interactiblesData.map(data => {
    let interactible;

    // Determine the type of interactible based on its properties
    if (data.hasOwnProperty("assignedPlayer")) {
      // If it has "taskCompleted" property, it's of type "task"
      interactible = {
        id: data.id,
        completed: data.taskCompleted,
        position: data.position,
        width: data.width,
        height: data.height,
        inProgress: data.inProgress,
        type: data.type,
        assignedPlayer: data.assignedPlayer
      };
    } else if(data.hasOwnProperty("found")) {
      interactible = {
        id: data.id,
        position: data.position,
        width: data.width,
        height: data.height,
        found: data.found,
      };
    }

    return interactible;
  });

  setInteractibles(parsedInteractibles);
};
