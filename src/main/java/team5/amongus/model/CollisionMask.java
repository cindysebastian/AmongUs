package team5.amongus.model;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.URL;

public class CollisionMask {
    private boolean[][] mask;
    private int imageWidth;
    private int imageHeight;

    public CollisionMask(String imageUrl) {
        loadImage(imageUrl);
    }

    private void loadImage(String imageUrl) {
        try {
            BufferedImage image = ImageIO.read(new URL(imageUrl));
            imageWidth = image.getWidth();
            imageHeight = image.getHeight();
            mask = createCollisionMask(image);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private boolean[][] createCollisionMask(BufferedImage image) {
        int width = image.getWidth();
        int height = image.getHeight();
        boolean[][] mask = new boolean[height][width];

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int alpha = (image.getRGB(x, y) >> 24) & 0xFF;
                mask[y][x] = alpha > 5; // Store true if pixel is solid, false otherwise
            }
        }

        return mask;
    }

    public boolean collidesWith(int playerX, int playerY, int playerWidth, int playerHeight) {
        if (mask == null || playerX < 0 || playerY < 0 || playerX >= imageWidth || playerY >= imageHeight) {
            return true; // Consider out of bounds as collision
        }

        // Calculate the range of pixels that the player's bounding box covers in the collision mask
        int startX = Math.max(0, (int) Math.floor(playerX));
        int endX = Math.min(imageWidth, (int) Math.ceil(playerX + playerWidth));
        int startY = Math.max(0, (int) Math.floor(playerY));
        int endY = Math.min(imageHeight, (int) Math.ceil(playerY + playerHeight));

        // Check each pixel in the player's bounding box against the collision mask
        for (int row = startY; row < endY; row++) {
            for (int col = startX; col < endX; col++) {
                if (mask[row][col]) {
                    return true; // Collision detected
                }
            }
        }

        return false; // No collision detected
    }
}
