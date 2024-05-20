package team5.amongus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

import team5.amongus.service.CollisionMaskService;
import team5.amongus.service.ICollisionMaskService;

@SpringBootApplication
@EnableScheduling
@ComponentScan(basePackages = {"team5.amongus"})
public class AmongusApplication {

	public static void main(String[] args) {
		SpringApplication.run(AmongusApplication.class, args);
	}

	@Bean
    public ICollisionMaskService collisionMaskService() {
        return new CollisionMaskService();
    }
}
