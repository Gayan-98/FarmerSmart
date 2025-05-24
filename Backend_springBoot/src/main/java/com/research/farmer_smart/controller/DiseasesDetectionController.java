package com.research.farmer_smart.controller;

import com.research.farmer_smart.controller.request.DiseasesDetectionRequest;
import com.research.farmer_smart.model.DiseasesDetection;
import com.research.farmer_smart.service.DiseasesDetectionService;
import java.util.List;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/diseases-detection")
public class DiseasesDetectionController {

  private static final Logger logger = LoggerFactory.getLogger(DiseasesDetectionController.class);
  private final DiseasesDetectionService diseasesDetectionService;

  @PostMapping("")
  public DiseasesDetection recordPestInfestation(@RequestBody DiseasesDetectionRequest request) {
    logger.info("Received diseases detection request: {}", request);
    try {
      DiseasesDetection result = diseasesDetectionService.recordDiseasesDetection(request);
      logger.info("Successfully recorded diseases detection: {}", result);
      System.out.println(result);
      return result;
    } catch (Exception e) {
      logger.error("Error recording diseases detection: ", e);
      throw e;
    }
  }

  @GetMapping("/farmer/{farmerId}")
  public List<DiseasesDetection> getFarmerDiseasesDetection(@PathVariable String farmerId) {
    return diseasesDetectionService.getFarmerDiseasesDetection(
        farmerId);
  }

  @GetMapping("/search")
  public List<DiseasesDetection> searchByDiseaseName(@RequestParam String diseaseName) {
    return diseasesDetectionService.searchByDiseaseName(diseaseName);
  }

  @GetMapping("/{id}")
  public DiseasesDetection getDiseasesDetectionById(@PathVariable String id) {
    return diseasesDetectionService.getPestInfestationById(id);
  }

  @GetMapping
  public ResponseEntity<List<DiseasesDetection>> getAllDisease() {
    try {
      logger.info("Received request to get all pest infestations");
      List<DiseasesDetection> disease = diseasesDetectionService.getAllDisease();
      return ResponseEntity.ok(disease);
    } catch (Exception e) {
      logger.error("Error getting pest infestations: {}", e.getMessage());
      return ResponseEntity.internalServerError().build();
    }
  }

}
