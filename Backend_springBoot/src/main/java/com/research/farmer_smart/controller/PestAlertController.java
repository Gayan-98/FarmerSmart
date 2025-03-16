package com.research.farmer_smart.controller;

import com.research.farmer_smart.model.Farmer;
import com.research.farmer_smart.model.PestInfestation;
import com.research.farmer_smart.service.NotificationService;
import com.research.farmer_smart.service.PestInfestationService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@AllArgsConstructor
@RequestMapping("/api/pest-alerts")
public class PestAlertController {
    
    private static final Logger logger = LoggerFactory.getLogger(PestAlertController.class);
    private final NotificationService notificationService;
    private final PestInfestationService pestInfestationService;

    @GetMapping("/area/{location}")
    public ResponseEntity<Map<String, Object>> getPestAlertsByArea(@PathVariable String location) {
        try {
            List<Farmer> farmersInArea = notificationService.getFarmersInArea(location);
            List<PestInfestation> recentInfestations = pestInfestationService.searchByLocation(location);
            
            // Count unique farmers in infestations
            Set<String> uniqueFarmerIds = recentInfestations.stream()
                .map(infestation -> infestation.getFarmer().getId())
                .collect(Collectors.toSet());
            
            // Count pest occurrences and get top threats
            Map<String, Long> pestCounts = recentInfestations.stream()
                .collect(Collectors.groupingBy(
                    PestInfestation::getPestName,
                    Collectors.counting()
                ));
            
            // Sort pests by frequency
            List<Map.Entry<String, Long>> topThreats = pestCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(3)
                .collect(Collectors.toList());
            
            // Create threat summary
            List<Map<String, Object>> threatSummary = topThreats.stream()
                .map(entry -> {
                    Map<String, Object> threat = new HashMap<>();
                    threat.put("pestName", entry.getKey());
                    threat.put("occurrences", entry.getValue());
                    threat.put("percentage", Math.round((entry.getValue() * 100.0) / recentInfestations.size()));
                    return threat;
                })
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("location", location);
            response.put("totalFarmersInArea", farmersInArea.size());
            response.put("affectedFarmers", uniqueFarmerIds.size());
            response.put("recentInfestations", recentInfestations);
            response.put("topThreats", threatSummary);
            response.put("alertLevel", getAlertLevel(recentInfestations.size()));
            response.put("timestamp", LocalDateTime.now());
            
            logger.info("Found {} infestations and {} farmers in {}", 
                recentInfestations.size(), farmersInArea.size(), location);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting pest alerts for location {}: {}", location, e.getMessage());
            throw e;
        }
    }

    @GetMapping("/farmers/{location}")
    public ResponseEntity<Map<String, Object>> getFarmersInArea(@PathVariable String location) {
        try {
            List<Farmer> farmers = notificationService.getFarmersInArea(location);
            Map<String, Object> response = new HashMap<>();
            response.put("location", location);
            response.put("farmers", farmers);
            response.put("count", farmers.size());
            
            logger.info("Found {} farmers in {}", farmers.size(), location);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting farmers for location {}: {}", location, e.getMessage());
            throw e;
        }
    }

    private String getAlertLevel(int infestationCount) {
        if (infestationCount >= 3) return "HIGH";
        if (infestationCount >= 2) return "MEDIUM";
        return "LOW";
    }
} 