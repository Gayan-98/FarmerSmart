package com.research.farmer_smart.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "disease_solutions")
public class DiseaseSolution {

  @Id
  private String id;

  @DBRef
  @NotNull
  private Expert expert;

  @NotNull
  private DiseasesDetection diseasesDetection;

  @NotBlank
  private String solutionDescription;

  @NotNull
  private LocalDateTime insertDateTime;

  @NotBlank
  private String diseaseName;
}
