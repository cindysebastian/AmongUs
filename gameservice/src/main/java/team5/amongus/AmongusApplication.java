package team5.amongus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@ComponentScan(basePackages = {"team5.amongus"})
public class AmongusApplication {

	public static void main(String[] args) {
		SpringApplication.run(AmongusApplication.class, args);
	}
}
