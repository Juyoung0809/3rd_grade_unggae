package juyoung.unggae;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class UnggaeApplication {

	public static void main(String[] args) {
		SpringApplication.run(UnggaeApplication.class, args);
	}

}
