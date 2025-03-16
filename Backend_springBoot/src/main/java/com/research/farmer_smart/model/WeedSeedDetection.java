package com.research.farmer_smart.model;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "weed_seed_detection")
public class WeedSeedDetection {

  @Id
  private String id;

  @NotNull
  private Farmer farmer;

  private Integer totalSeeds;

  private String seedClass;

  private Integer barnyardgrass;

  private Integer glume;

  private Integer jungleRiceA;

  private Integer jungleRiceB;

  private Integer saromaccaGrass;

  private Integer riceSeeds;
}
