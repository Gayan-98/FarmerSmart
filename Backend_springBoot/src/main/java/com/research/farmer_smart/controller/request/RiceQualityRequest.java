package com.research.farmer_smart.controller.request;

import lombok.Data;

@Data
public class RiceQualityRequest {
  private String farmerId;
  private Integer totalGrains;
  private Integer goodQuality;
  private Integer mediumQuality;
  private Integer poorQuality;
  private String predictedRiceType;
  private String predictedRiceQuality;
}
