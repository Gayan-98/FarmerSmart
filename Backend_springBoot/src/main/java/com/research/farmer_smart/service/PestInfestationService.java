package com.research.farmer_smart.service;

import com.research.farmer_smart.controller.request.PestInfestationRequest;
import com.research.farmer_smart.model.PestInfestation;
import java.util.List;

public interface PestInfestationService {
    PestInfestation recordPestInfestation(PestInfestationRequest request);
    List<PestInfestation> getFarmerPestInfestations(String farmerId);
    List<PestInfestation> searchByPestName(String pestName);
    PestInfestation getPestInfestationById(String id);
} 