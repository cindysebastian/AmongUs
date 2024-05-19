import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './MiniGame.module.css';

interface Props {
    onSlide: (position: number) => void; // Callback function to handle slider position changes
    onComplete: () => void; // Callback function to handle completion
}
const WoodenBeamSlider: React.FC<Props> = ({ onSlide, onComplete }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isLocked, setIsLocked] = useState(false); // Add state for locking
    const sliderRef = useRef<HTMLDivElement>(null);
    const positionRef = useRef(0);
    const [sliderWidth, setSliderWidth] = useState(0);

    const handleMouseDown = (event: React.MouseEvent) => {
        if (!isLocked && sliderRef.current) {
            setSliderWidth(sliderRef.current.clientWidth);
            const railWidth = sliderRef.current.clientWidth;
            const clickX = event.clientX - sliderRef.current.getBoundingClientRect().left;
            const initialPosition = clickX; // No need to adjust initial position
            positionRef.current = Math.max(0, Math.min(railWidth * 0.7, initialPosition)); // Adjusted to move 30% from the left
            setIsDragging(true);
        }
    };
    
    
    

    const handleMouseMove = useCallback(
        (event: MouseEvent) => {
            if (!isLocked && isDragging && sliderRef.current) { // Check if not locked
                const clientX = event.clientX;
                const newPosition = Math.min(Math.max(0, clientX - sliderRef.current.getBoundingClientRect().left), sliderWidth);
                const normalizedPosition = newPosition / sliderWidth;

                if (normalizedPosition >= 0.5) {
                    onSlide(0.5);
                    positionRef.current = 0.5 * sliderWidth;
                    setIsLocked(true); // Lock the slider
                } else {
                    positionRef.current = newPosition;
                    onSlide(normalizedPosition);
                }

                sliderRef.current.style.left = `${positionRef.current}px`;
            }
        },
        [isLocked, isDragging, sliderWidth, onSlide]
    );

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            if (sliderRef.current) {
                sliderRef.current.style.transition = 'transform 0.3s ease';
            }
        }
    }, [isDragging]);

    useEffect(() => {
        const handleMouseMoveEvent = (event: MouseEvent) => handleMouseMove(event);
        const handleMouseUpEvent = () => handleMouseUp();

        document.addEventListener('mousemove', handleMouseMoveEvent);
        document.addEventListener('mouseup', handleMouseUpEvent);

        return () => {
            document.removeEventListener('mousemove', handleMouseMoveEvent);
            document.removeEventListener('mouseup', handleMouseUpEvent);
        };
    }, [handleMouseMove, handleMouseUp]);

    return (
        <div
            ref={sliderRef}
            className={styles.slider}
            onMouseDown={handleMouseDown}
        >
            <div className={styles.sliderRail}></div>
            <div
                className={styles.woodBeam}
                style={{ left: `${positionRef.current}px` }} // Use left instead of transform
            ></div>
        </div>
    );
};
export default WoodenBeamSlider;