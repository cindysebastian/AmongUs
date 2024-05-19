// ProgressBar.tsx

import React from 'react';
import styles from '../styles/Progressbar.module.css';

interface Props {
  progress: number; // Progress percentage
}

const ProgressBar: React.FC<Props> = ({ progress }) => {
  return (
    <div className={styles.progressBarContainer}>
      <div className={styles.progressBar} style={{ width: `${progress}%` }} />
    </div>
  );
};

export default ProgressBar;
