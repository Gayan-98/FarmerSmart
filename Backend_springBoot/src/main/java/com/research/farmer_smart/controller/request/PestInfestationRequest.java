package com.research.farmer_smart.controller.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PestInfestationRequest {
    private String farmerId;
    private String pestName;
    private String detectedLocation;
    @NotNull
    private Double latitude;
    @NotNull
    private Double longitude;
    private LocalDateTime detectionDateTime;
} 