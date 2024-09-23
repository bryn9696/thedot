package com.example.dotgame.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ResultService {

    private Map<String, String> resultMap = new HashMap<>();

    public void addResult(String name, String result) {
        System.out.println("Adding result: " + name + " - " + result); // Log for verification
        resultMap.put(name, result);
    }

    // New method to retrieve the entire HashMap
    public Map<String, String> getAllResults() {
        return resultMap;
    }
}
