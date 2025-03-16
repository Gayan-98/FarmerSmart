package com.research.farmer_smart.service.serviceImpl;

import com.research.farmer_smart.controller.request.PestSolutionRequest;
import com.research.farmer_smart.exception.PestInfestationException;
import com.research.farmer_smart.model.Expert;
import com.research.farmer_smart.model.PestInfestation;
import com.research.farmer_smart.model.PestSolution;
import com.research.farmer_smart.repository.ExpertRepository;
import com.research.farmer_smart.repository.PestInfestationRepository;
import com.research.farmer_smart.repository.PestSolutionRepository;
import com.research.farmer_smart.service.PestSolutionService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class PestSolutionServiceImpl implements PestSolutionService {

    private static final Logger logger = LoggerFactory.getLogger(PestSolutionServiceImpl.class);
    
    private final PestSolutionRepository pestSolutionRepository;
    private final ExpertRepository expertRepository;
    private final PestInfestationRepository pestInfestationRepository;

    private static final Set<String> VALID_PEST_NAMES = Set.of(
            "rice leaf roller", "rice leaf caterpillar", "paddy stem maggot",
            "asiatic rice borer", "yellow rice borer", "rice gall midge",
            "brown plant hopper", "rice stem fly", "rice water weevil",
            "rice leaf hopper", "rice shell pest", "thrips"
    );

    @Override
    public PestSolution addSolution(PestSolutionRequest request) {
        logger.info("Processing pest solution request for pest: {}", request.getPestName());
        
        // Convert pest name to lowercase for validation
        String pestName = request.getPestName().toLowerCase().trim();
        
        // Validate pest name
        if (!isValidPestName(pestName)) {
            logger.error("Invalid pest name: {}", pestName);
            throw new PestInfestationException("Invalid pest name: " + pestName + ". Valid pest names are: " + String.join(", ", VALID_PEST_NAMES));
        }

        // Find expert
        Expert expert = expertRepository.findById(request.getExpertId())
                .orElseThrow(() -> {
                    logger.error("Expert not found with ID: {}", request.getExpertId());
                    return new PestInfestationException("Expert not found with ID: " + request.getExpertId());
                });
        logger.info("Found expert: {}", expert.getId());

        // Find pest infestation
        PestInfestation pestInfestation = pestInfestationRepository.findById(request.getPestInfestationId())
                .orElseThrow(() -> {
                    logger.error("Pest infestation not found with ID: {}", request.getPestInfestationId());
                    return new PestInfestationException("Pest infestation not found with ID: " + request.getPestInfestationId());
                });
        logger.info("Found pest infestation: {}", pestInfestation.getId());

        try {
            PestSolution solution = new PestSolution();
            solution.setExpert(expert);
            solution.setPestInfestation(pestInfestation);
            solution.setSolutionDescription(request.getSolutionDescription().trim());
            solution.setPestName(pestName);
            solution.setInsertDateTime(LocalDateTime.now());

            PestSolution savedSolution = pestSolutionRepository.save(solution);
            logger.info("Successfully saved pest solution with ID: {}", savedSolution.getId());
            return savedSolution;
        } catch (Exception e) {
            logger.error("Error saving pest solution: {}", e.getMessage());
            throw new PestInfestationException("Failed to save pest solution: " + e.getMessage());
        }
    }

    @Override
    public List<PestSolution> getSolutionsByPestName(String pestName) {
        if (!isValidPestName(pestName)) {
            throw new PestInfestationException("Invalid pest name: " + pestName);
        }
        return pestSolutionRepository.findByPestNameIgnoreCase(pestName);
    }

    @Override
    public List<PestSolution> getExpertSolutions(String expertId) {
        Expert expert = expertRepository.findById(expertId)
                .orElseThrow(() -> new PestInfestationException("Expert not found"));
        return pestSolutionRepository.findByExpert(expert);
    }

    @Override
    public List<PestSolution> getSolutionsForPestInfestation(String pestInfestationId) {
        PestInfestation pestInfestation = pestInfestationRepository.findById(pestInfestationId)
                .orElseThrow(() -> new PestInfestationException("Pest infestation not found"));
        return pestSolutionRepository.findByPestInfestation(pestInfestation);
    }

    @Override
    public boolean isValidPestName(String pestName) {
        return pestName != null && VALID_PEST_NAMES.contains(pestName.toLowerCase());
    }
} 