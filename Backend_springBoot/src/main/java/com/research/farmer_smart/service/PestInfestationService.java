package com.research.farmer_smart.service;

import com.research.farmer_smart.controller.request.PestInfestationRequest;
import com.research.farmer_smart.model.PestInfestation;

import java.util.List;
import java.util.Optional;

public interface PestInfestationService {
    PestInfestation recordPestInfestation(PestInfestationRequest request);
    List<PestInfestation> getFarmerPestInfestations(String farmerId);
    List<PestInfestation> searchByPestName(String pestName);
    List<PestInfestation> searchByLocation(String location);
    Optional<PestInfestation> getPestInfestationById(String id);
    PestInfestation savePestInfestation(PestInfestation pestInfestation);
    List<PestInfestation> getAllPestInfestations();
} 