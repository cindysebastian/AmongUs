package team5.amongus.model;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class CollisionMaskConfig {

    @Bean
    public CollisionMask collisionMask() throws IOException {
        InputStream resource = getClass().getResourceAsStream("/LobbyBG_withTransparentGround.png");
        if (resource == null) {
            throw new IOException("Resource not found: /LobbyBG_withTransparentGround.png");
        }

        BufferedImage image = ImageIO.read(resource);

        int width = image.getWidth();
        int height = image.getHeight();
        int[] pixels = new int[width * height];
        image.getRGB(0, 0, width, height, pixels, 0, width);

        byte[] mask = new byte[width * height];
        for (int i = 0; i < pixels.length; i++) {
            int alpha = (pixels[i] >> 24) & 0xff;
            mask[i] = (byte) (alpha > 5 ? 1 : 0); // Store 1 if pixel is solid, 0 otherwise
        }

        CollisionMask collisionMask = new CollisionMask(width, height, mask);

        // Save the debug image
        BufferedImage debugImage = collisionMask.createDebugImage();
        File outputfile = new File("./src/main/resources/debug_collision_mask.png");
        ImageIO.write(debugImage, "png", outputfile);

        return collisionMask;
    }
}
