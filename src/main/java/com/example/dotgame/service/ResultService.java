package com.example.dotgame.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ResultService {

    // HashMap to store results in-memory
    private final Map<String, Result> results = new HashMap<>();

    // Class to represent a result with clicks
    public static class Result {
        private String result;
        private int clicks;

        public Result(String result, int clicks) {
            this.result = result;
            this.clicks = clicks;
        }

        public String getResult() {
            return result;
        }

        public int getClicks() {
            return clicks;
        }
    }

    // Method to add a result
    public void addResult(String name, String result, int clicks) {
        results.put(name, new Result(result, clicks)); // Store the result and clicks
    }

    // Method to retrieve all results
    public Map<String, Result> getAllResults() {
        return results; // Return the current results
    }
}
