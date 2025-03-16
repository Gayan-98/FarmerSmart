package com.research.farmer_smart.service.serviceImpl;

import com.research.farmer_smart.controller.request.PestInfestationRequest;
import com.research.farmer_smart.exception.FarmerNotFoundException;
import com.research.farmer_smart.exception.PestInfestationException;
import com.research.farmer_smart.model.Farmer;
import com.research.farmer_smart.model.PestInfestation;
import com.research.farmer_smart.repository.FarmerRepository;
import com.research.farmer_smart.repository.PestInfestationRepository;
import com.research.farmer_smart.service.NotificationService;
import com.research.farmer_smart.service.PestInfestationService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class PestInfestationServiceImpl implements PestInfestationService {

    private final PestInfestationRepository pestInfestationRepository;
    private final FarmerRepository farmerRepository;
    private final NotificationService notificationService;
    
    private static final int ALERT_THRESHOLD = 3; // Number of infestations that trigger an alert

    @Override
    public PestInfestation recordPestInfestation(PestInfestationRequest request) {
        try {
            Farmer farmer = farmerRepository.findById(request.getFarmerId())
                    .orElseThrow(() -> new FarmerNotFoundException("Farmer not found with ID: " + request.getFarmerId()));

            PestInfestation pestInfestation = new PestInfestation();
            pestInfestation.setFarmer(farmer);
            pestInfestation.setPestName(request.getPestName());
            pestInfestation.setDetectedLocation(request.getDetectedLocation());
            pestInfestation.setDetectionDateTime(request.getDetectionDateTime());

            PestInfestation savedInfestation = pestInfestationRepository.save(pestInfestation);

            // Check for multiple infestations in the area
            checkAndNotifyAreaInfestation(request.getDetectedLocation(), request.getPestName());

            return savedInfestation;
        } catch (Exception e) {
            throw new PestInfestationException("Error recording pest infestation: " + e.getMessage());
        }
    }

    private void checkAndNotifyAreaInfestation(String location, String pestName) {
        // Count recent infestations in the area (last 7 days)
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        List<PestInfestation> recentInfestations = pestInfestationRepository
            .findByDetectedLocationAndPestNameAndDetectionDateTimeAfter(
                location, pestName, oneWeekAgo);

        if (recentInfestations.size() >= ALERT_THRESHOLD) {
            notificationService.notifyFarmersInArea(
                location, 
                pestName, 
                recentInfestations.size()
            );
        }
    }

    @Override
    public List<PestInfestation> getFarmerPestInfestations(String farmerId) {
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new FarmerNotFoundException("Farmer not found"));
        return pestInfestationRepository.findByFarmer(farmer);
    }

    @Override
    public List<PestInfestation> searchByPestName(String pestName) {
        return pestInfestationRepository.findByPestNameContainingIgnoreCase(pestName);
    }

    @Override
    public PestInfestation getPestInfestationById(String id) {
        return pestInfestationRepository.findById(id)
                .orElseThrow(() -> new PestInfestationException("Pest infestation record not found"));
    }

    @Override
    public List<PestInfestation> searchByLocation(String location) {
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        return pestInfestationRepository.findByDetectedLocationContainingIgnoreCaseAndDetectionDateTimeAfter(
            location, 
            oneWeekAgo
        );
    }
} 