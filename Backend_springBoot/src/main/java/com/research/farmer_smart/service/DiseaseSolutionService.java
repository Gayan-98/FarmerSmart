package com.research.farmer_smart.service;

import com.research.farmer_smart.controller.request.DiseaseSolutionRequest;
import com.research.farmer_smart.model.DiseaseSolution;
import jakarta.validation.Valid;
import java.util.List;

public interface DiseaseSolutionService {

  DiseaseSolution addSolution(@Valid DiseaseSolutionRequest request);

  List<DiseaseSolution> getSolutionsByDiseaseName(String diseaseName);

  List<DiseaseSolution> getExpertSolutions(String expertId);

  List<DiseaseSolution> getSolutionsForDiseaseDetection(String diseaseDetectionId);

  boolean isValidDiseaseName(String diseaseName);
}
