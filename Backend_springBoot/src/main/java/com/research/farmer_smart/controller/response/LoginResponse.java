package com.research.farmer_smart.controller.response;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class LoginResponse {
    private String message;
    private String id;
    private String username;
    private String role;
} 