package com.example.dotgame;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class DotGameApplication {

    public static void main(String[] args) {
        SpringApplication.run(DotGameApplication.class, args);
    }
}
