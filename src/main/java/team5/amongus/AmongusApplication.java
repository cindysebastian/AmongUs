package team5.amongus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AmongusApplication {

	public static void main(String[] args) {
		SpringApplication.run(AmongusApplication.class, args);
	}
}
