package com.research.farmer_smart.service;

import com.research.farmer_smart.model.Farmer;
import java.util.List;
import java.util.Optional;

public interface FarmerService {
    Optional<Farmer> getFarmerById(String id);
    Farmer saveFarmer(Farmer farmer);
    List<Farmer> getAllFarmers();
} 