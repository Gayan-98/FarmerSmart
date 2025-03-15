package com.research.farmer_smart.controller;

import com.research.farmer_smart.controller.request.LoginRequest;
import com.research.farmer_smart.controller.request.SignUpRequest;
import com.research.farmer_smart.controller.response.AuthResponse;
import com.research.farmer_smart.model.User;
import com.research.farmer_smart.service.UserService;
import lombok.AllArgsConstructor;
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
  public AuthResponse login(@RequestBody LoginRequest request) {
    User user = userService.authenticateUser(request);
    AuthResponse response = new AuthResponse();
    response.setMessage("Login successful");
    return response;
  }
}
