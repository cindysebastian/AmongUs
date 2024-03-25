package team5.amongus.model;

import team5.amongus.components.PlayerPosition;
import javax.swing.text.AttributeSet.ColorAttribute;

public abstract class Player {
    public String Name;
    public ColorAttribute Color;
    public boolean IsDead;

    public PlayerPosition PlayerPosition;

    private void Movement() {

    }
}
