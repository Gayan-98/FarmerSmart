package com.research.farmer_smart.controller;

import com.research.farmer_smart.controller.request.RiceQualityRequest;
import com.research.farmer_smart.model.RiceQuality;
import com.research.farmer_smart.service.RiceQualityService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/rice-quality")
public class RiceQualityController {

  private static final Logger logger = LoggerFactory.getLogger(RiceQualityController.class);
  private final RiceQualityService riceQualityService;

  @PostMapping("")
  public RiceQuality recordRiceQuality(@RequestBody RiceQualityRequest request) {
    logger.info("Received rice quality request: {}", request);
    try {
      RiceQuality result = riceQualityService.recordRiceQuality(request);
      logger.info("Successfully recorded rice quality: {}", result);
      return result;
    } catch (Exception e) {
      logger.error("Error recording rice quality: ", e);
      throw e;
    }
  }
}
