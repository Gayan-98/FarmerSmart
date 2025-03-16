package com.research.farmer_smart.repository;

import com.research.farmer_smart.model.PestSolution;
import com.research.farmer_smart.model.Expert;
import com.research.farmer_smart.model.PestInfestation;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PestSolutionRepository extends MongoRepository<PestSolution, String> {
    List<PestSolution> findByPestNameIgnoreCase(String pestName);
    List<PestSolution> findByExpert(Expert expert);
    List<PestSolution> findByPestInfestation(PestInfestation pestInfestation);
} 