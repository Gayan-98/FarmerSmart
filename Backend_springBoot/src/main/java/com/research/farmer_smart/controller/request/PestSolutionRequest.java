package com.research.farmer_smart.controller.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PestSolutionRequest {
    @NotBlank(message = "Expert ID is required")
    private String expertId;
    
    @NotBlank(message = "Pest Infestation ID is required")
    private String pestInfestationId;
    
    @NotBlank(message = "Solution description is required")
    private String solutionDescription;
    
    @NotBlank(message = "Pest name is required")
    private String pestName;
} 