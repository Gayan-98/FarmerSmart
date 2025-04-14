package com.research.farmer_smart.controller;

import com.research.farmer_smart.controller.request.PestInfestationRequest;
import com.research.farmer_smart.model.PestInfestation;
import com.research.farmer_smart.service.PestInfestationService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/pest-infestations")
public class PestInfestationController {

    private static final Logger logger = LoggerFactory.getLogger(PestInfestationController.class);
    private final PestInfestationService pestInfestationService;

    @PostMapping
    public ResponseEntity<PestInfestation> recordPestInfestation(@RequestBody PestInfestation pestInfestation) {
        try {
            logger.info("Received request to record pest infestation: {}", pestInfestation);
            PestInfestation savedInfestation = pestInfestationService.savePestInfestation(pestInfestation);
            return ResponseEntity.ok(savedInfestation);
        } catch (Exception e) {
            logger.error("Error recording pest infestation: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<PestInfestation>> getAllPestInfestations() {
        try {
            logger.info("Received request to get all pest infestations");
            List<PestInfestation> infestations = pestInfestationService.getAllPestInfestations();
            return ResponseEntity.ok(infestations);
        } catch (Exception e) {
            logger.error("Error getting pest infestations: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<PestInfestation>> getFarmerPestInfestations(@PathVariable String farmerId) {
        return ResponseEntity.ok(pestInfestationService.getFarmerPestInfestations(farmerId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PestInfestation>> searchByPestName(@RequestParam String pestName) {
        return ResponseEntity.ok(pestInfestationService.searchByPestName(pestName));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PestInfestation> getPestInfestationById(@PathVariable String id) {
        try {
            logger.info("Received request to get pest infestation by id: {}", id);
            return pestInfestationService.getPestInfestationById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Error getting pest infestation by id: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
} 