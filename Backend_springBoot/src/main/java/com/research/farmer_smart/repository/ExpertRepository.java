package com.research.farmer_smart.repository;

import com.research.farmer_smart.model.Expert;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ExpertRepository extends MongoRepository<Expert, String> {

}
