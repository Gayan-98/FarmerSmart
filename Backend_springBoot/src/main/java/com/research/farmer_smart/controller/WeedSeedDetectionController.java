package com.research.farmer_smart.controller;

import com.research.farmer_smart.controller.request.WeedSeedDetectionRequest;
import com.research.farmer_smart.model.WeedSeedDetection;
import com.research.farmer_smart.service.WeedSeedDetectionService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/weed-seed-detection")
public class WeedSeedDetectionController {

  private static final Logger logger = LoggerFactory.getLogger(WeedSeedDetectionController.class);
  private final WeedSeedDetectionService weedSeedDetectionService;

  @PostMapping("")
  public WeedSeedDetection recordWeedSeedDetection(@RequestBody WeedSeedDetectionRequest request) {
    logger.info("Received weed seed detection request: {}", request);
    try {
      WeedSeedDetection result = weedSeedDetectionService.recordWeedSeedDetection(request);
      logger.info("Successfully recorded weed seed detection: {}", result);
      return result;
    } catch (Exception e) {
      logger.error("Error recording weed seed detection: ", e);
      throw e;
    }
  }
}
