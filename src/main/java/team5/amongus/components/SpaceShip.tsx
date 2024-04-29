import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import styles from '../../amongus/spaceship.module.css';

const SpaceShip = ({ players }) => {
  return (
    <div>
      <div className={styles.gifBackground}></div> {/* GIF background */}
      <div className={styles.spaceShipBackground}>
        {/* Your spaceship content goes here */}
      </div>
    </div>
  );
};

export default SpaceShip;