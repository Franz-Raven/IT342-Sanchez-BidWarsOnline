package edu.cit.sanchez.bidwarsonline.shared.dto;

public enum GameType {
    PLINKO("Plinko"),
    MINES("Mines"),
    HI_LO("Hi-Lo");

    private final String displayName;

    GameType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}



