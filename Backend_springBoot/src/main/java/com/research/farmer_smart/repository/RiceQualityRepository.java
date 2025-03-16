package com.research.farmer_smart.repository;

import com.research.farmer_smart.model.RiceQuality;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RiceQualityRepository extends MongoRepository<RiceQuality, String> {
}
