package com.research.farmer_smart.service;

import com.research.farmer_smart.controller.request.PestInfestationRequest;
import com.research.farmer_smart.exception.FarmerNotFoundException;
import com.research.farmer_smart.exception.PestInfestationException;
import com.research.farmer_smart.model.PestInfestation;
import com.research.farmer_smart.model.Farmer;
import com.research.farmer_smart.repository.PestInfestationRepository;
import com.research.farmer_smart.repository.FarmerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PestInfestationServiceImpl implements PestInfestationService {
    private static final Logger logger = LoggerFactory.getLogger(PestInfestationServiceImpl.class);
    private static final int ALERT_THRESHOLD = 3; // Number of infestations that trigger an alert

    @Autowired
    private PestInfestationRepository pestInfestationRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    public PestInfestation recordPestInfestation(PestInfestationRequest request) {
        try {
            logger.info("Recording pest infestation: {}", request);
            
            Farmer farmer = farmerRepository.findById(request.getFarmerId())
                .orElseThrow(() -> new FarmerNotFoundException("Farmer not found with ID: " + request.getFarmerId()));

            PestInfestation pestInfestation = new PestInfestation();
            pestInfestation.setFarmer(farmer);
            pestInfestation.setPestName(request.getPestName());
            pestInfestation.setDetectedLocation(request.getDetectedLocation());
            pestInfestation.setLatitude(request.getLatitude());
            pestInfestation.setLongitude(request.getLongitude());
            pestInfestation.setDetectionDateTime(request.getDetectionDateTime());

            PestInfestation savedInfestation = pestInfestationRepository.save(pestInfestation);

            // Check for multiple infestations in the area
            checkAndNotifyAreaInfestation(request.getDetectedLocation(), request.getPestName());

            return savedInfestation;
        } catch (Exception e) {
            logger.error("Error recording pest infestation: {}", e.getMessage());
            throw new PestInfestationException("Error recording pest infestation: " + e.getMessage());
        }
    }

    private void checkAndNotifyAreaInfestation(String location, String pestName) {
        try {
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
        } catch (Exception e) {
            logger.error("Error checking area infestation: {}", e.getMessage());
        }
    }

    @Override
    public List<PestInfestation> getFarmerPestInfestations(String farmerId) {
        try {
            logger.info("Retrieving pest infestations for farmer: {}", farmerId);
            Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new FarmerNotFoundException("Farmer not found with ID: " + farmerId));
            return pestInfestationRepository.findByFarmer(farmer);
        } catch (Exception e) {
            logger.error("Error retrieving pest infestations for farmer: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public List<PestInfestation> searchByPestName(String pestName) {
        try {
            logger.info("Searching pest infestations by pest name: {}", pestName);
            return pestInfestationRepository.findByPestNameContainingIgnoreCase(pestName);
        } catch (Exception e) {
            logger.error("Error searching pest infestations by pest name: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public List<PestInfestation> searchByLocation(String location) {
        try {
            logger.info("Searching pest infestations by location: {}", location);
            LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
            return pestInfestationRepository.findByDetectedLocationContainingIgnoreCaseAndDetectionDateTimeAfter(
                location, 
                oneWeekAgo
            );
        } catch (Exception e) {
            logger.error("Error searching pest infestations by location: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public Optional<PestInfestation> getPestInfestationById(String id) {
        try {
            logger.info("Retrieving pest infestation by id: {}", id);
            return pestInfestationRepository.findById(id);
        } catch (Exception e) {
            logger.error("Error retrieving pest infestation by id: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public PestInfestation savePestInfestation(PestInfestation pestInfestation) {
        try {
            logger.info("Saving pest infestation: {}", pestInfestation);
            return pestInfestationRepository.save(pestInfestation);
        } catch (Exception e) {
            logger.error("Error saving pest infestation: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public List<PestInfestation> getAllPestInfestations() {
        try {
            logger.info("Retrieving all pest infestations");
            return pestInfestationRepository.findAll();
        } catch (Exception e) {
            logger.error("Error retrieving pest infestations: {}", e.getMessage());
            throw e;
        }
    }
} 