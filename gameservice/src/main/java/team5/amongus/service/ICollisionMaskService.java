package team5.amongus.service;

import team5.amongus.model.CollisionMask;

public interface ICollisionMaskService {
    CollisionMask loadCollisionMask(String imageUrl);
    CollisionMask createCollisionMask(int width, int height, byte[] mask);
}
