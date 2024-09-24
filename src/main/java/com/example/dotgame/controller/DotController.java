package com.example.dotgame.controller;

import com.example.dotgame.model.Dot;
import com.example.dotgame.service.DotService;
import com.example.dotgame.service.ResultService;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DotController {

    private final DotService dotService;
    private final ResultService resultService;

    // HashMap to store results in-memory
    private Map<String, String> results = new HashMap<>();

    public DotController(DotService dotService, ResultService resultService) {
        this.dotService = dotService;
        this.resultService = resultService;
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

    // Endpoint to add result when the game ends (either win or lose)
    @PostMapping("/submitResult")
    public ResponseEntity<String> submitResult(@RequestParam String name, @RequestParam String result, @RequestParam int clicks) {
        System.out.println("Submitting result: " + name + " - " + result + " - Clicks: " + clicks); // Log for verification
        resultService.addResult(name, result, clicks); // Update to save clicks
        return ResponseEntity.ok("Result submitted successfully");
    }


    // Endpoint to retrieve all results
    @GetMapping("/getResults")
    public Map<String, Map<String, Object>> getResults() {
        Map<String, Map<String, Object>> resultsResponse = new HashMap<>();
        for (Map.Entry<String, ResultService.Result> entry : resultService.getAllResults().entrySet()) {
            Map<String, Object> resultDetails = new HashMap<>();
            resultDetails.put("result", entry.getValue().getResult());
            resultDetails.put("clicks", entry.getValue().getClicks());
            resultsResponse.put(entry.getKey(), resultDetails); // Add both result and clicks
        }
        return resultsResponse;
    }


    // Scheduled task to clear results every 24 hours (86400000 ms = 24 hours)
    @Scheduled(fixedRate = 86400000) // Runs every 24 hours
    public void clearResults() {
        results.clear(); // Clear the HashMap
        System.out.println("Results cleared. New 24-hour session started.");
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
