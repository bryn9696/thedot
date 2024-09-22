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
        dotService.startGame();
        return "Game started!";
    }

    @GetMapping("/dot")
    public Dot getDot() {
        System.out.println("Getting dot: x=" + dotService.getDot().getX() + ", y=" + dotService.getDot().getY());
        return dotService.getDot();
    }

    @PostMapping("/click")
    public ResponseEntity<String> clickDot(@RequestParam int mouseX, @RequestParam int mouseY) {
        boolean dotHit = dotService.clickDot(mouseX, mouseY);
        if (dotHit) {
            return ResponseEntity.ok("Dot clicked!");
        } else {
            return ResponseEntity.ok("Missed the dot!");
        }
    }
}
