package com.research.farmer_smart.repository;

import com.research.farmer_smart.model.PestInfestation;
import com.research.farmer_smart.model.Farmer;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PestInfestationRepository extends MongoRepository<PestInfestation, String> {
    List<PestInfestation> findByFarmer(Farmer farmer);
    List<PestInfestation> findByPestNameContainingIgnoreCase(String pestName);
} 