package com.research.farmer_smart.controller.request;

import lombok.Data;

@Data
public class WeedSeedDetectionRequest {
  private String farmerId;
  private Integer totalSeeds;
  private String seedClass;
  private Integer barnyardgrass;
  private Integer glume;
  private Integer jungleRiceA;
  private Integer jungleRiceB;
  private Integer saromaccaGrass;
  private Integer riceSeeds;
}
