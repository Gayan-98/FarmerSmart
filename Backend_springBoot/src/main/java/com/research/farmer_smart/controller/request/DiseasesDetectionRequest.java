package com.research.farmer_smart.controller.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DiseasesDetectionRequest {
  private String farmerId;
  private String diseaseName;
  private String detectedLocation;

  @NotNull
  private Double longitude;
  @NotNull
  private Double latitude;
  private LocalDateTime detectionDateTime;
}
