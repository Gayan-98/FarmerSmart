package com.research.farmer_smart.controller.request;

import com.research.farmer_smart.model.Role;
import lombok.Data;

@Data
public class SignUpRequest {
  private String username;
  private String email;
  private String password;
  private Role role;
}
