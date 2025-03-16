package com.research.farmer_smart.controller.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DiseaseSolutionRequest {
  @NotBlank(message = "Expert ID is required")
  private String expertId;

  @NotBlank(message = "Disease Detection ID is required")
  private String diseaseDetectionId;

  @NotBlank(message = "Solution description is required")
  private String solutionDescription;

  @NotBlank(message = "Disease name is required")
  private String diseaseName;
}
