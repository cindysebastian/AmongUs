import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import styles from '../../amongus/spaceship.module.css';

const SpaceShip = ({ players }) => {
  return (
    <div className={styles.spaceShipBackground}>
      {/* Your spaceship content goes here */}
    </div>
  );
};

export default SpaceShip;