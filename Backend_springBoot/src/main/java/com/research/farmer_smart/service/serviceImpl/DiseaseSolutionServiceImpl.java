package com.research.farmer_smart.service.serviceImpl;

import com.research.farmer_smart.controller.request.DiseaseSolutionRequest;
import com.research.farmer_smart.exception.DiseasesDetectionException;
import com.research.farmer_smart.exception.ExpertNotFoundException;
import com.research.farmer_smart.model.DiseaseSolution;
import com.research.farmer_smart.model.DiseasesDetection;
import com.research.farmer_smart.model.Expert;
import com.research.farmer_smart.repository.DiseaseSolutionRepository;
import com.research.farmer_smart.repository.DiseasesDetectionRepository;
import com.research.farmer_smart.repository.ExpertRepository;
import com.research.farmer_smart.service.DiseaseSolutionService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class DiseaseSolutionServiceImpl implements DiseaseSolutionService {

  private static final Logger logger = LoggerFactory.getLogger(DiseaseSolutionServiceImpl.class);

  private final DiseaseSolutionRepository diseaseSolutionRepository;
  private final ExpertRepository expertRepository;
  private final DiseasesDetectionRepository diseasesDetectionRepository;

  private static final Set<String> VALID_DISEASE_NAMES = Set.of(
      "Bacterial Blight", "blast", "brown spot", "tungro"
  );

  @Override
  public DiseaseSolution addSolution(DiseaseSolutionRequest request) {
    logger.info("Processing request for disease detection: {}", request.getDiseaseName());

    String diseaseName = request.getDiseaseName().toLowerCase().trim();

    if (!isValidDiseaseName(diseaseName)) {
      logger.error("Invalid disease name: {}", diseaseName);
      throw new DiseasesDetectionException(
          "Invalid disease name: " + diseaseName + ". Valid disease names are: " + String.join(", ",
              VALID_DISEASE_NAMES));
    }

    Expert expert = expertRepository.findById(request.getExpertId())
        .orElseThrow(() -> {
          logger.error("Expert not found with ID: {}", request.getExpertId());
          return new ExpertNotFoundException("Expert not found with ID: " + request.getExpertId());
        });
    logger.info("Found expert: {}", expert.getId());

    DiseasesDetection diseasesDetection = diseasesDetectionRepository.findById(
            request.getDiseaseDetectionId())
        .orElseThrow(() -> {
          logger.error("Disease detection not found with ID: {}", request.getDiseaseDetectionId());
          return new DiseasesDetectionException(
              "Disease detection not found with ID: " + request.getDiseaseDetectionId());
        });
    logger.info("Found disease detection: {}", diseasesDetection.getId());

    try {
      DiseaseSolution solution = new DiseaseSolution();
      solution.setExpert(expert);
      solution.setDiseasesDetection(diseasesDetection);
      solution.setSolutionDescription(request.getSolutionDescription().trim());
      solution.setDiseaseName(diseaseName);
      solution.setInsertDateTime(LocalDateTime.now());

      DiseaseSolution savedSolution = diseaseSolutionRepository.save(solution);
      logger.info("Successfully saved disease solution with ID: {}", savedSolution.getId());
      return savedSolution;
    } catch (Exception e) {
      logger.error("Error saving disease solution: {}", e.getMessage());
      throw new DiseasesDetectionException("Failed to save disease solution: " + e.getMessage());
    }
  }

  @Override
  public List<DiseaseSolution> getSolutionsByDiseaseName(String diseaseName) {
    if (!isValidDiseaseName(diseaseName)) {
      throw new DiseasesDetectionException("Invalid disease name: " + diseaseName);
    }
    return diseaseSolutionRepository.findByDiseaseName(diseaseName);
  }

  @Override
  public List<DiseaseSolution> getExpertSolutions(String expertId) {
    Expert expert = expertRepository.findById(expertId)
        .orElseThrow(() -> new ExpertNotFoundException("Expert not found"));
    return diseaseSolutionRepository.findByExpert(expert);
  }

  @Override
  public List<DiseaseSolution> getSolutionsForDiseaseDetection(String diseaseDetectionId) {
    DiseasesDetection diseasesDetection = diseasesDetectionRepository.findById(diseaseDetectionId)
        .orElseThrow(() -> new DiseasesDetectionException("Disease detection not found"));
    return diseaseSolutionRepository.findByDiseasesDetection(diseasesDetection);
  }

  @Override
  public boolean isValidDiseaseName(String diseaseName) {
    return diseaseName != null && VALID_DISEASE_NAMES.contains(diseaseName.toLowerCase());
  }
}
