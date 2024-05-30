package team5.amongus.model;

import java.io.Serializable;
import java.util.Objects;

public class Position implements Serializable {
    private int x;
    private int y;

    public Position(int x, int y) {
        this.x = x;
        this.y = y;
    }

    // Getter und Setter
    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    // Directions enum for clarity
    public enum Direction {
        UP, DOWN, LEFT, RIGHT
    }

    // Method to calculate the next position
    public Position getNextPosition(Direction direction, int stepSize) {
        int newX = this.x;
        int newY = this.y;

        switch (direction) {
            case UP:
                newY -= stepSize;
                break;
            case DOWN:
                newY += stepSize;
                break;
            case LEFT:
                newX -= stepSize;
                break;
            case RIGHT:
                newX += stepSize;
                break;
        }

        return new Position(newX, newY);
    }

    public String toString() {
        return "Position: X " + getX() + " Y " + getY();
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }
        Position position = (Position) obj;
        return x == position.x && y == position.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }
}
