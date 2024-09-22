package com.example.dotgame.controller;

import com.example.dotgame.model.Dot;
import com.example.dotgame.service.DotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class DotController {

    private final DotService dotService;

    public DotController(DotService dotService) {
        this.dotService = dotService;
    }

    @GetMapping("/start")
    public String startGame() {
        dotService.startGame(); // Initialize game logic if needed
        return "Game started";
    }

    @GetMapping("/dot")
    public Dot getDot() {
        Dot dot = dotService.getDot();
        System.out.println("Getting dot: x=" + dot.getX() + ", y=" + dot.getY());
        return dot; // Return the current dot position
    }

    @PostMapping("/click")
    public ResponseEntity<String> clickDot(@RequestParam int mouseX, @RequestParam int mouseY) {
        boolean withinLimit = dotService.clickDot(mouseX, mouseY);
        if (dotService.isGameOver()) {
            return ResponseEntity.ok("Game Over! You've exceeded the maximum number of clicks.");
        }
        return withinLimit ? ResponseEntity.ok("Dot clicked!") : ResponseEntity.ok("Click limit exceeded");
    }

//    @PostMapping("/submitScore")
//    public ResponseEntity<String> submitScore(@RequestParam String userName, @RequestParam long score) {
//        Result result = new Result(userName, score);
//        resultsService.saveResult(result);
//        return ResponseEntity.ok("Score submitted!");
//    }
//
//    @GetMapping("/results")
//    public List<Result> getResults() {
//        return resultsService.getResults();
//    }
}
