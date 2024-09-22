package com.example.dotgame.service;

import com.example.dotgame.model.Dot;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.Timer;
import java.util.TimerTask;

@Service
public class DotService {

    private static final int DOT_SIZE = 50; // Size of the dot
    private static final int GAME_AREA_WIDTH = 800; // Width of the game area
    private static final int GAME_AREA_HEIGHT = 600; // Height of the game area
    private Dot dot; // Current dot
    private boolean gameOver; // Track if the game is over
    private Timer dotTimer; // Timer for moving the dot

    public DotService() {
        this.dot = new Dot(0, 0); // Initial dot position
        this.gameOver = false;
    }

    // Start the game and move the dot periodically
    public void startGame() {
        Random random = new Random();
        moveDotRandomly(); // Move the dot initially
        gameOver = false;

        if (dotTimer != null) {
            dotTimer.cancel(); // Cancel any previous timer
        }

        dotTimer = new Timer();
        dotTimer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                if (!gameOver) {
                    moveDotRandomly();
                }
            }
        }, 0, 1000); // Move the dot every 1 second
    }

    // Move the dot to a random position within the game area
    private void moveDotRandomly() {
        Random random = new Random();
        dot.setX(random.nextInt(GAME_AREA_WIDTH - DOT_SIZE));
        dot.setY(random.nextInt(GAME_AREA_HEIGHT - DOT_SIZE));
        System.out.println("Moving dot to: x=" + dot.getX() + ", y=" + dot.getY());
    }

    // Get the current dot position
    public Dot getDot() {
        return dot;
    }

    // Handle a user clicking on the dot
    public boolean clickDot(int mouseX, int mouseY) {
        int hitArea = 20; // Buffer area around the dot for easier clicking
        boolean isHit = (mouseX >= dot.getX() - hitArea && mouseX <= dot.getX() + DOT_SIZE + hitArea) &&
                (mouseY >= dot.getY() - hitArea && mouseY <= dot.getY() + DOT_SIZE + hitArea);

        if (isHit) {
            gameOver = true; // End the game if the dot is clicked
            if (dotTimer != null) {
                dotTimer.cancel();
            }
            return true;
        }
        return false;
    }

    // Check if the game is over
    public boolean isGameOver() {
        return gameOver;
    }
}
