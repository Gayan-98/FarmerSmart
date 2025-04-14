package com.research.farmer_smart.service;

import com.research.farmer_smart.model.Farmer;
import com.research.farmer_smart.repository.FarmerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FarmerServiceImpl implements FarmerService {
    private static final Logger logger = LoggerFactory.getLogger(FarmerServiceImpl.class);

    @Autowired
    private FarmerRepository farmerRepository;

    @Override
    public Optional<Farmer> getFarmerById(String id) {
        try {
            logger.info("Retrieving farmer by id: {}", id);
            return farmerRepository.findById(id);
        } catch (Exception e) {
            logger.error("Error retrieving farmer by id: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public Farmer saveFarmer(Farmer farmer) {
        try {
            logger.info("Saving farmer: {}", farmer);
            return farmerRepository.save(farmer);
        } catch (Exception e) {
            logger.error("Error saving farmer: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public List<Farmer> getAllFarmers() {
        try {
            logger.info("Retrieving all farmers");
            return farmerRepository.findAll();
        } catch (Exception e) {
            logger.error("Error retrieving farmers: {}", e.getMessage());
            throw e;
        }
    }
} 