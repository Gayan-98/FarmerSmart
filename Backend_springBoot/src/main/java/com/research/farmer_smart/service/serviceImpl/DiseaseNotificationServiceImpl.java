package com.research.farmer_smart.service.serviceImpl;

import com.research.farmer_smart.model.Farmer;
import com.research.farmer_smart.repository.FarmerRepository;
import com.research.farmer_smart.service.DiseaseNotificationService;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class DiseaseNotificationServiceImpl  implements DiseaseNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(DiseaseNotificationServiceImpl.class);
    private final FarmerRepository farmerRepository;

    @Override
    public void notifyFarmersInArea(String location, String diseaseName, int infestationCount) {
        List<Farmer> farmersInArea = getFarmersInArea(location);
        if (farmersInArea.isEmpty()) {
            logger.warn("No farmers found in area: {}", location);
            return;
        }
        logger.info("Found {} farmers in area {} with pest {}", farmersInArea.size(), location, diseaseName);
    }
    @Override
    public List<Farmer> getFarmersInArea(String location) {
        // Use the new query method
        List<Farmer> farmers = farmerRepository.findFarmersByArea(location);
        logger.info("Found {} farmers in area {}", farmers.size(), location);
        return farmers;
    }
}
