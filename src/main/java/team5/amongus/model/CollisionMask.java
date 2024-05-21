package team5.amongus.model;

import java.awt.*;
import java.awt.image.BufferedImage;

public class CollisionMask {
    private final boolean[][] mask;
    private final int imageWidth;
    private final int imageHeight;

    public CollisionMask(int width, int height, boolean[][] mask) {
        this.imageWidth = width;
        this.imageHeight = height;
        this.mask = mask;
    }

    public boolean getCollidesWithBorder(int x, int y) {
        if (x < 0 || y < 0 || x >= imageWidth || y >= imageHeight) {
            return true; // Consider out of bounds as collision
        }
        return mask[y][x];
    }

    public boolean collidesWith(int playerX, int playerY, int playerWidth, int playerHeight) {
        int startX = playerX + (int) Math.round(playerWidth * 0.3);
        int endX = playerX + playerWidth - (int) Math.round(playerWidth * 0.3);
        int startY = playerY + (int) Math.round(playerHeight * 0.90);
        int endY = playerY + (int) Math.round(playerHeight * 0.95);

        for (int row = startY; row < endY; row++) {
            for (int col = startX; col < endX; col++) {
                if (mask[row][col]) {
                    return true; // Collision detected
                }
            }
        }
        return false; // No collision detected
    }

    public int getImageWidth() {
        return imageWidth;
    }

    public int getImageHeight() {
        return imageHeight;
    }

    public BufferedImage createDebugImage() {
        BufferedImage debugImage = new BufferedImage(imageWidth, imageHeight, BufferedImage.TYPE_INT_ARGB);
        for (int y = 0; y < imageHeight; y++) {
            for (int x = 0; x < imageWidth; x++) {
                if (mask[y][x]) {
                    debugImage.setRGB(x, y, Color.RED.getRGB()); // Red for collision areas
                } else {
                    debugImage.setRGB(x, y, new Color(0, 0, 0, 0).getRGB()); // Transparent for non-collision areas
                }
            }
        }
        return debugImage;
    }
}
