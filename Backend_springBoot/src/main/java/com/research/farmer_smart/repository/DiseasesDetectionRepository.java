package com.research.farmer_smart.repository;

import com.research.farmer_smart.model.DiseasesDetection;
import com.research.farmer_smart.model.Farmer;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DiseasesDetectionRepository extends MongoRepository<DiseasesDetection, String> {

  List<DiseasesDetection> findByFarmer(Farmer farmer);

  List<DiseasesDetection> findByDiseaseName(String diseaseName);
}
