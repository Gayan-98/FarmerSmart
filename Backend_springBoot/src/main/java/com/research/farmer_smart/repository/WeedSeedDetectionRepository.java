package com.research.farmer_smart.repository;

import com.research.farmer_smart.model.WeedSeedDetection;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface WeedSeedDetectionRepository extends MongoRepository<WeedSeedDetection, String> {

}
