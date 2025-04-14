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
import java.util.*;
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
            // Get all pest infestations for the location
            List<PestInfestation> allInfestations = pestInfestationService.searchByLocation(location);
            logger.info("Found {} total infestations for location: {}", allInfestations.size(), location);

            if (allInfestations.isEmpty()) {
                Map<String, Object> emptyResponse = new HashMap<>();
                emptyResponse.put("location", location);
                emptyResponse.put("totalInfestations", 0);
                emptyResponse.put("affectedLocations", Collections.emptySet());
                emptyResponse.put("recentInfestations", Collections.emptyList());
                emptyResponse.put("topThreats", Collections.emptyList());
                emptyResponse.put("alertLevel", "LOW");
                emptyResponse.put("timestamp", LocalDateTime.now());
                return ResponseEntity.ok(emptyResponse);
            }

            // Get unique locations affected
            Set<String> affectedLocations = allInfestations.stream()
                .map(PestInfestation::getDetectedLocation)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
            
            // Count pest occurrences and get top threats
            Map<String, Long> pestCounts = allInfestations.stream()
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
                    threat.put("percentage", Math.round((entry.getValue() * 100.0) / allInfestations.size()));
                    return threat;
                })
                .collect(Collectors.toList());

            // Sort infestations by date (most recent first)
            List<PestInfestation> recentInfestations = allInfestations.stream()
                .sorted(Comparator.comparing(PestInfestation::getDetectionDateTime).reversed())
                .limit(10)  // Get only the 10 most recent
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("location", location);
            response.put("totalInfestations", allInfestations.size());
            response.put("affectedLocations", affectedLocations);
            response.put("recentInfestations", recentInfestations);
            response.put("topThreats", threatSummary);
            response.put("alertLevel", getAlertLevel(allInfestations.size()));
            response.put("timestamp", LocalDateTime.now());
            
            logger.info("Processed alerts for location: {}. Found {} infestations across {} areas", 
                location, allInfestations.size(), affectedLocations.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error getting pest alerts for location {}: {}", location, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch pest alerts");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("location", location);
            errorResponse.put("timestamp", LocalDateTime.now());
            return ResponseEntity.internalServerError().body(errorResponse);
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
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch farmers");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("location", location);
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    private String getAlertLevel(int infestationCount) {
        if (infestationCount >= 3) return "HIGH";
        if (infestationCount >= 2) return "MEDIUM";
        return "LOW";
    }
} 