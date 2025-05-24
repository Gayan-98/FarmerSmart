package com.research.farmer_smart.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "diseases_detections")
public class DiseasesDetection {

  @Id
  private String id;

  @NotNull
  private Farmer farmer;

  @NotBlank
  private String diseaseName;

  @NotBlank
  private String detectedLocation;

  @NotNull
  private Double longitude;

  @NotNull
  private Double latitude;

  @NotNull
  private LocalDateTime detectionDateTime;
}
