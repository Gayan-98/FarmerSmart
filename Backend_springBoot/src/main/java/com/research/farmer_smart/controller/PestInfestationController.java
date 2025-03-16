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
    public ResponseEntity<PestInfestation> recordPestInfestation(@RequestBody PestInfestationRequest request) {
        logger.info("Received pest infestation request: {}", request);
        try {
            PestInfestation result = pestInfestationService.recordPestInfestation(request);
            logger.info("Successfully recorded pest infestation: {}", result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error recording pest infestation: ", e);
            throw e;
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
        return ResponseEntity.ok(pestInfestationService.getPestInfestationById(id));
    }
} 