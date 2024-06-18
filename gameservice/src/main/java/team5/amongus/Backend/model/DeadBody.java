package team5.amongus.Backend.model;

public class DeadBody extends Interactible{
    private boolean found = false; 
    
    

    public DeadBody(Position position){
        super.setPosition(position);
        setHeight(60);
        setWidth(50);
    }

    public void setFound(boolean found){
        this.found = found;
    }

    public boolean getFound(){
        return found;
    }
}
