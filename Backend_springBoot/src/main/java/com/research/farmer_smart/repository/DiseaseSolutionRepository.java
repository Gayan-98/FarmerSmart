package com.research.farmer_smart.repository;

import com.research.farmer_smart.model.DiseaseSolution;
import com.research.farmer_smart.model.DiseasesDetection;
import com.research.farmer_smart.model.Expert;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DiseaseSolutionRepository extends MongoRepository<DiseaseSolution, String> {

  List<DiseaseSolution> findByDiseaseName(String diseaseName);

  List<DiseaseSolution> findByExpert(Expert expert);

  List<DiseaseSolution> findByDiseasesDetection(DiseasesDetection diseasesDetection);
}
