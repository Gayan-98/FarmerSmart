package com.research.farmer_smart.service;

import com.research.farmer_smart.controller.request.LoginRequest;
import com.research.farmer_smart.controller.request.SignUpRequest;
import com.research.farmer_smart.model.User;

public interface UserService {
  User registerUser(SignUpRequest request);

  User authenticateUser(LoginRequest request);

  User getUserById(String userId);
}
