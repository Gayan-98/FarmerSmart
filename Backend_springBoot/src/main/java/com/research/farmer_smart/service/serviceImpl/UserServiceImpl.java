package com.research.farmer_smart.service.serviceImpl;

import com.research.farmer_smart.controller.request.LoginRequest;
import com.research.farmer_smart.controller.request.SignUpRequest;
import com.research.farmer_smart.model.*;
import com.research.farmer_smart.repository.ExpertRepository;
import com.research.farmer_smart.repository.FarmerRepository;
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
  private final FarmerRepository farmerRepository;
  private final ExpertRepository expertRepository;
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

    if (request.getRole() == Role.FARMER) {
      Farmer farmer = new Farmer();
      farmer.setFirstName(request.getFirstName());
      farmer.setLastName(request.getLastName());
      farmer.setContactNumber(request.getContactNumber());
      farmer.setEmail(request.getEmail());
      farmer.setLandSize(request.getLandSize());
      farmer.setLandLocation(request.getLandLocation());
      farmer.setRegistrationDate(request.getRegistrationDate());

      Farmer savedFarmer = farmerRepository.save(farmer);
      user.setFarmer(savedFarmer);
    }

    else if (request.getRole() == Role.EXPERT) {
      Expert expert = new Expert();
      expert.setFirstName(request.getFirstName());
      expert.setLastName(request.getLastName());
      expert.setContactNumber(request.getContactNumber());
      expert.setAssignedArea(request.getAssignedArea());
      expert.setDesignation(request.getDesignation());
      expert.setRegistrationDate(request.getRegistrationDate());

      Expert savedExpert = expertRepository.save(expert);
      user.setExpert(savedExpert);
    }

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
