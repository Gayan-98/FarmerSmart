package com.research.farmer_smart.controller;

import com.research.farmer_smart.controller.request.DiseaseSolutionRequest;
import com.research.farmer_smart.exception.DiseasesDetectionException;
import com.research.farmer_smart.model.DiseaseSolution;
import com.research.farmer_smart.service.DiseaseSolutionService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/disease-solutions")
public class DiseaseSolutionController {

  private static final Logger logger = LoggerFactory.getLogger(DiseaseSolutionController.class);
  private final DiseaseSolutionService diseaseSolutionService;

  @PostMapping("")
  public DiseaseSolution addSolution(@Valid @RequestBody DiseaseSolutionRequest request) {
    logger.info("Received request for disease detection: {}", request.getDiseaseName());
    try {
      DiseaseSolution result = diseaseSolutionService.addSolution(request);
      logger.info("Successfully created disease solution with ID: {}", result.getId());
      return result;
    } catch (DiseasesDetectionException e) {
      logger.error("Validation error: {}", e.getMessage());
      throw e;
    } catch (Exception e) {
      logger.error("Unexpected error while adding disease solution: ", e);
      throw new DiseasesDetectionException("Failed to process request: " + e.getMessage());
    }
  }

  @GetMapping("/disease/{diseaseName}")
  public List<DiseaseSolution> getSolutionsByDiseaseName(@PathVariable String diseaseName) {
    return diseaseSolutionService.getSolutionsByDiseaseName(diseaseName);
  }

  @GetMapping("/expert/{expertId}")
  public List<DiseaseSolution> getExpertSolutions(@PathVariable String expertId) {
    return diseaseSolutionService.getExpertSolutions(expertId);
  }

  @GetMapping("/infestation/{diseaseDetectionId}")
  public List<DiseaseSolution> getSolutionsForDiseaseDetection(
      @PathVariable String diseaseDetectionId) {
    return diseaseSolutionService.getSolutionsForDiseaseDetection(diseaseDetectionId);
  }
}
