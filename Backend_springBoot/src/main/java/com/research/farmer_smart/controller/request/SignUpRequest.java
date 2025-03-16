package com.research.farmer_smart.controller.request;

import com.research.farmer_smart.model.Role;
import java.time.LocalDate;
import lombok.Data;

@Data
public class SignUpRequest {
  private String username;
  private String email;
  private String password;
  private Role role;

  // Farmer / Expert common fields
  private String firstName;
  private String lastName;
  private String contactNumber;
  private LocalDate registrationDate;

  // Farmer-specific fields
  private String landSize;
  private String landLocation;

  // Expert-specific fields
  private String assignedArea;
  private String designation;
  private String specialization;
  private String qualifications;
}
