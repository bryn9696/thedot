package com.example.dotgame.service;

import com.example.dotgame.model.Dot;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.Timer;
import java.util.TimerTask;

@Service
public class DotService {

    private static final int DOT_SIZE = 50;
    private static final int MOVE_SPEED = 10; // Speed of movement
    private Dot dot;
    private long startTime;
    private long elapsedTime;
    private Timer timer;
    private boolean gameOver;
    private int currentDirection = 0; // 0: right, 1: down, 2: left, 3: up
    private int moveX = MOVE_SPEED; // Initial horizontal movement speed
    private int moveY = MOVE_SPEED; // Initial vertical movement speed

    public DotService() {
        this.dot = new Dot(0, 0);
        this.gameOver = false;
        startGame(); // Initialize the dot position on service creation
    }

    public void startGame() {
        Random random = new Random();
        dot.setX(random.nextInt(800 - DOT_SIZE)); // Set dot within the window size
        dot.setY(random.nextInt(600 - DOT_SIZE)); // Set dot within the window size
        moveX = MOVE_SPEED; // Reset horizontal movement direction
        moveY = MOVE_SPEED; // Reset vertical movement direction
        gameOver = false;
        elapsedTime = 0;

        // Start the upward-counting timer
        startTimer();
        startDotMovement(); // Start moving the dot
    }

    public Dot getDot() {
        return dot;
    }

    public boolean clickDot(int mouseX, int mouseY) {
        int hitArea = 20; // Increased hit area for easier clicking
        boolean isHit = (mouseX >= dot.getX() - hitArea && mouseX <= dot.getX() + DOT_SIZE + hitArea) &&
                (mouseY >= dot.getY() - hitArea && mouseY <= dot.getY() + DOT_SIZE + hitArea);

        if (isHit) {
            gameOver = true;
            return true;
        } else {
            return false;
        }
    }

    public boolean isGameOver() {
        return gameOver;
    }

    public long getElapsedTime() {
        return elapsedTime;
    }

    private void startTimer() {
        timer = new Timer();
        startTime = System.currentTimeMillis();

        TimerTask task = new TimerTask() {
            @Override
            public void run() {
                if (!gameOver) {
                    elapsedTime = System.currentTimeMillis() - startTime;
                }
            }
        };
        timer.scheduleAtFixedRate(task, 0, 1000); // Update every second for time tracking
    }

    private void startDotMovement() {
        Timer dotMovementTimer = new Timer();
        dotMovementTimer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                if (!gameOver) {
                    moveDot();
                }
            }
        }, 0, 50); // Update position every 50ms
    }

    private void moveDot() {
        // Update dot's position
        dot.setX(dot.getX() + moveX);
        dot.setY(dot.getY() + moveY);

        // Check for boundary collisions
        if (dot.getX() < 0 || dot.getX() > 800 - DOT_SIZE) {
            moveX = -moveX; // Reverse direction on x-axis
        }
        if (dot.getY() < 0 || dot.getY() > 600 - DOT_SIZE) {
            moveY = -moveY; // Reverse direction on y-axis
        }
    }
}
