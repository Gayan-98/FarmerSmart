package com.research.farmer_smart.controller.response;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class LoginResponse {
    private String message;
    private String userId;     // Main user ID
    private String profileId;  // Farmer/Expert ID
    private String username;
    private String role;
} 