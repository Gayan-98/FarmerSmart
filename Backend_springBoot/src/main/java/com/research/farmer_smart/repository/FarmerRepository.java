package com.research.farmer_smart.repository;

import com.research.farmer_smart.model.Farmer;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FarmerRepository extends MongoRepository<Farmer, String> {

}
