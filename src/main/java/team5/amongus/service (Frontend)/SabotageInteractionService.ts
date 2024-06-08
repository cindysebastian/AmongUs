export const handleReceivedSabotageTasks = (sabotageTasksData, setSabotageTasks) => {

  const parsedInteractibles = sabotageTasksData.map((data) => {

    return {
      id: data.id,
      completed: data.taskCompleted,
      position: data.position,
      width: data.width,
      height: data.height,
      inProgress: data.inProgress,
      sabotage: data.sabotage,
    };
  });

  setSabotageTasks(parsedInteractibles);
};