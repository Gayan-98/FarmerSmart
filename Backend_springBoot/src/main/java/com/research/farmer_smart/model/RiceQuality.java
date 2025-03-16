package com.research.farmer_smart.model;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "rice_quality")
public class RiceQuality {

  @Id
  private String id;

  @NotNull
  private Farmer farmer;

  private Integer totalGrains;

  private Integer goodQuality;

  private Integer mediumQuality;

  private Integer poorQuality;

  private String predictedRiceType;

  private String predictedRiceQuality;
}
