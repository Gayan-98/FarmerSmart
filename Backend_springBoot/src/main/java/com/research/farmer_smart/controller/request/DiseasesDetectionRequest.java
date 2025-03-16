package com.research.farmer_smart.controller.request;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class DiseasesDetectionRequest {
  private String farmerId;
  private String diseaseName;
  private String detectedLocation;
  private LocalDateTime detectionDateTime;
}
