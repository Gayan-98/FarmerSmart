package com.research.farmer_smart.controller;

import com.research.farmer_smart.controller.request.LoginRequest;
import com.research.farmer_smart.controller.request.SignUpRequest;
import com.research.farmer_smart.controller.response.LoginResponse;
import com.research.farmer_smart.model.User;
import com.research.farmer_smart.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;

@RestController
@AllArgsConstructor
@RequestMapping("/auth")
public class AuthController {

  private final UserService userService;

  @PostMapping("/signup")
  public User signup(@RequestBody SignUpRequest request) {
    return userService.registerUser(request);
  }

  @PostMapping("/login")
  public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
    User user = userService.authenticateUser(request);
    
    String userId = user.getId();
    String profileId = null;
    String username = null;
    
    if (user.getFarmer() != null) {
      profileId = user.getFarmer().getId();
      username = user.getFarmer().getFirstName() + " " + user.getFarmer().getLastName();
    } else if (user.getExpert() != null) {
      profileId = user.getExpert().getId();
      username = user.getExpert().getFirstName() + " " + user.getExpert().getLastName();
    }

    LoginResponse response = LoginResponse.builder()
            .message("Login successful")
            .userId(userId)
            .profileId(profileId)
            .username(username)
            .role(user.getRole().toString())
            .build();

    return ResponseEntity.ok(response);
  }

  @GetMapping("/user/{userId}")
  public ResponseEntity<?> getUserDetails(@PathVariable String userId) {
    try {
      User user = userService.getUserById(userId);
      Map<String, Object> response = new HashMap<>();
      
      // Basic user info
      response.put("userId", user.getId());
      response.put("email", user.getEmail());
      response.put("username", user.getUsername());
      response.put("role", user.getRole().toString());
      
      // Add farmer details if exists
      if (user.getFarmer() != null) {
        Map<String, Object> farmerDetails = new HashMap<>();
        farmerDetails.put("id", user.getFarmer().getId());
        farmerDetails.put("firstName", user.getFarmer().getFirstName());
        farmerDetails.put("lastName", user.getFarmer().getLastName());
        farmerDetails.put("email", user.getFarmer().getEmail());
        farmerDetails.put("contactNumber", user.getFarmer().getContactNumber());
        farmerDetails.put("landSize", user.getFarmer().getLandSize());
        farmerDetails.put("landLocation", user.getFarmer().getLandLocation());
        farmerDetails.put("registrationDate", user.getFarmer().getRegistrationDate());
        response.put("farmerDetails", farmerDetails);
      }
      
      // Add expert details if exists
      if (user.getExpert() != null) {
        Map<String, Object> expertDetails = new HashMap<>();
        expertDetails.put("id", user.getExpert().getId());
        expertDetails.put("firstName", user.getExpert().getFirstName());
        expertDetails.put("lastName", user.getExpert().getLastName());
        expertDetails.put("email", user.getExpert().getEmail());
        expertDetails.put("contactNumber", user.getExpert().getContactNumber());
        expertDetails.put("assignedArea", user.getExpert().getAssignedArea());
        expertDetails.put("designation", user.getExpert().getDesignation());
        expertDetails.put("specialization", user.getExpert().getSpecialization());
        expertDetails.put("qualifications", user.getExpert().getQualifications());
        expertDetails.put("registrationDate", user.getExpert().getRegistrationDate());
        response.put("expertDetails", expertDetails);
      }
      
      return ResponseEntity.ok(response);
    } catch (Exception e) {
      Map<String, String> errorResponse = new HashMap<>();
      errorResponse.put("error", "Error fetching user details: " + e.getMessage());
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }
  }
}
