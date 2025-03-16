package com.research.farmer_smart.controller.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PestInfestationRequest {
    private String farmerId;
    private String pestName;
    private String detectedLocation;
    private LocalDateTime detectionDateTime;
} 