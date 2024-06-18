package team5.amongus.Backend.model;

import java.util.ArrayList;

public class Interactible implements Cloneable {

    private Position position;
    private long id;
    private int width = 100;
    private int height = 100;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public CollisionBox getBounds() {
        return new CollisionBox(position.getX(), position.getY(), width, height);
    }

    public Position getPosition() {
        return position;
    }

    public int getHeight() {
        return height;
    }

    public int getWidth() {
        return width;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public void setPosition(Position position) {
        this.position = position;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    @Override
    public String toString() {
        return "Interactible{" +
                "id=" + id +
                '}';
    }

    public static Interactible getInteractibleById(int interactibleId, ArrayList<Interactible> interactibles) {
        for (Interactible interactible : interactibles) {
            if (interactible.getId() == interactibleId) {
                return interactible;
            }
        }
        return null;
    }

    @Override
    public Interactible clone() {
        try {
            return (Interactible) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException("Clone not supported", e);
        }
    }
}
