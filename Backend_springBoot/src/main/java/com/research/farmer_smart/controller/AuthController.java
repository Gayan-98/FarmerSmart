package com.research.farmer_smart.controller;

import com.research.farmer_smart.controller.request.LoginRequest;
import com.research.farmer_smart.controller.request.SignUpRequest;
import com.research.farmer_smart.controller.response.LoginResponse;
import com.research.farmer_smart.model.User;
import com.research.farmer_smart.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    
    String userId = null;
    String username = null;
    
    if (user.getFarmer() != null) {
      userId = user.getFarmer().getId();
      username = user.getFarmer().getFirstName() + " " + user.getFarmer().getLastName();
    } else if (user.getExpert() != null) {
      userId = user.getExpert().getId();
      username = user.getExpert().getFirstName() + " " + user.getExpert().getLastName();
    }

    LoginResponse response = LoginResponse.builder()
            .message("Login successful")
            .id(userId)
            .username(username)
            .role(user.getRole().toString())
            .build();

    return ResponseEntity.ok(response);
  }
}
