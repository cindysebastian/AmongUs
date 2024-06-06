package team5.amongus.model;

public class DeadBody extends Interactible{
    private boolean found = false; 
    

    public DeadBody(Position position){
        super.setPosition(position);
    }

    public void setFound(boolean found){
        this.found = found;
    }

    public boolean getFound(){
        return found;
    }
}
