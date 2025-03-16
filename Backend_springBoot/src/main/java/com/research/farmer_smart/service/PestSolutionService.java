package com.research.farmer_smart.service;

import com.research.farmer_smart.controller.request.PestSolutionRequest;
import com.research.farmer_smart.model.PestSolution;
import java.util.List;

public interface PestSolutionService {
    PestSolution addSolution(PestSolutionRequest request);
    List<PestSolution> getSolutionsByPestName(String pestName);
    List<PestSolution> getExpertSolutions(String expertId);
    List<PestSolution> getSolutionsForPestInfestation(String pestInfestationId);
    boolean isValidPestName(String pestName);
} 