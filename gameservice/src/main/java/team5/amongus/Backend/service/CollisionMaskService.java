package team5.amongus.Backend.service;

import javax.imageio.ImageIO;

import org.springframework.stereotype.Service;

import team5.amongus.Backend.model.CollisionMask;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;

@Service
public class CollisionMaskService implements ICollisionMaskService {

    @Override
    public CollisionMask loadCollisionMask(String imagePath) {
        try (InputStream imageStream = getClass().getResourceAsStream(imagePath)) {
            if (imageStream == null) {
                throw new IOException("Resource not found: " + imagePath);
            }
            BufferedImage image = ImageIO.read(imageStream);
            int imageWidth = image.getWidth();
            int imageHeight = image.getHeight();
            boolean[][] mask = createMaskFromImage(image, imageWidth, imageHeight);
            return new CollisionMask(imageWidth, imageHeight, mask);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public CollisionMask createCollisionMask(int width, int height, byte[] maskData) {
        boolean[][] mask = new boolean[height][width];
        for (int i = 0; i < maskData.length; i++) {
            int x = i % width;
            int y = i / width;
            mask[y][x] = maskData[i] == 1;
        }
        return new CollisionMask(width, height, mask);
    }

    private boolean[][] createMaskFromImage(BufferedImage image, int width, int height) {
        boolean[][] mask = new boolean[height][width];
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                int alpha = (image.getRGB(x, y) >> 24) & 0xFF;
                mask[y][x] = alpha > 10; // Store true if pixel is solid, false otherwise
            }
        }
        return mask;
    }
}
