package com.research.farmer_smart.repository;

import com.research.farmer_smart.model.User;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {

  Optional<User> findByEmail(String email);
}
