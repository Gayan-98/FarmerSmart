package com.research.farmer_smart.controller;

import com.research.farmer_smart.controller.request.PestSolutionRequest;
import com.research.farmer_smart.exception.PestInfestationException;
import com.research.farmer_smart.model.PestSolution;
import com.research.farmer_smart.service.PestSolutionService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/pest-solutions")
public class PestSolutionController {

    private static final Logger logger = LoggerFactory.getLogger(PestSolutionController.class);
    private final PestSolutionService pestSolutionService;

    @PostMapping
    public ResponseEntity<PestSolution> addSolution(@Valid @RequestBody PestSolutionRequest request) {
        logger.info("Received pest solution request for pest: {}", request.getPestName());
        try {
            PestSolution result = pestSolutionService.addSolution(request);
            logger.info("Successfully created pest solution with ID: {}", result.getId());
            return ResponseEntity.ok(result);
        } catch (PestInfestationException e) {
            logger.error("Validation error: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error while adding pest solution: ", e);
            throw new PestInfestationException("Failed to process request: " + e.getMessage());
        }
    }

    @GetMapping("/pest/{pestName}")
    public ResponseEntity<List<PestSolution>> getSolutionsByPestName(@PathVariable String pestName) {
        return ResponseEntity.ok(pestSolutionService.getSolutionsByPestName(pestName));
    }

    @GetMapping("/expert/{expertId}")
    public ResponseEntity<List<PestSolution>> getExpertSolutions(@PathVariable String expertId) {
        return ResponseEntity.ok(pestSolutionService.getExpertSolutions(expertId));
    }

    @GetMapping("/infestation/{pestInfestationId}")
    public ResponseEntity<List<PestSolution>> getSolutionsForPestInfestation(@PathVariable String pestInfestationId) {
        return ResponseEntity.ok(pestSolutionService.getSolutionsForPestInfestation(pestInfestationId));
    }
} 