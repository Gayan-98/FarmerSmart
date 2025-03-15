package com.research.farmer_smart.service.serviceImpl;

import com.research.farmer_smart.controller.request.LoginRequest;
import com.research.farmer_smart.controller.request.SignUpRequest;
import com.research.farmer_smart.model.User;
import com.research.farmer_smart.repository.UserRepository;
import com.research.farmer_smart.service.UserService;
import java.util.Optional;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  @Override
  public User registerUser(SignUpRequest request) {
    Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
    if (existingUser.isPresent()) {
      throw new RuntimeException("Email already exists");
    }

    User user = new User();
    user.setUsername(request.getUsername());
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setRole(request.getRole());

    return userRepository.save(user);
  }

  @Override
  public boolean authenticateUser(LoginRequest request) {
    Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

    if (userOptional.isPresent()) {
      User user = userOptional.get();
      return passwordEncoder.matches(request.getPassword(), user.getPassword());
    }
    return false;
  }
}
