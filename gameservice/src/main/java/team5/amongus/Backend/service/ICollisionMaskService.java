package team5.amongus.Backend.service;

import team5.amongus.Backend.model.CollisionMask;

public interface ICollisionMaskService {
    CollisionMask loadCollisionMask(String imageUrl);
    CollisionMask createCollisionMask(int width, int height, byte[] mask);
}
