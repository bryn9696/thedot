package com.example.dotgame;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
@EnableScheduling // Enable scheduling to run the 24-hour reset task
public class DotGameApplicationMain {

    public static void main(String[] args) {
        SpringApplication.run(DotGameApplicationMain.class, args);
    }
}
