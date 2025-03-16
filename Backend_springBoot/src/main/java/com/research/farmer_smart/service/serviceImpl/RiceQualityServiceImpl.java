package com.research.farmer_smart.service.serviceImpl;

import com.research.farmer_smart.controller.request.RiceQualityRequest;
import com.research.farmer_smart.exception.FarmerNotFoundException;
import com.research.farmer_smart.exception.RiceQualityException;
import com.research.farmer_smart.model.Farmer;
import com.research.farmer_smart.model.RiceQuality;
import com.research.farmer_smart.repository.FarmerRepository;
import com.research.farmer_smart.repository.RiceQualityRepository;
import com.research.farmer_smart.service.RiceQualityService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class RiceQualityServiceImpl implements RiceQualityService {

  private final FarmerRepository farmerRepository;
  private final RiceQualityRepository riceQualityRepository;

  @Override
  public RiceQuality recordRiceQuality(RiceQualityRequest request) {
    try {
      Farmer farmer = farmerRepository.findById(request.getFarmerId())
          .orElseThrow(() -> new FarmerNotFoundException(
              "Farmer not found with ID: " + request.getFarmerId()));

      RiceQuality riceQuality = new RiceQuality();
      riceQuality.setFarmer(farmer);
      riceQuality.setTotalGrains(request.getTotalGrains());
      riceQuality.setGoodQuality(request.getGoodQuality());
      riceQuality.setMediumQuality(request.getMediumQuality());
      riceQuality.setPoorQuality(request.getPoorQuality());
      riceQuality.setPredictedRiceType(request.getPredictedRiceType());
      riceQuality.setPredictedRiceQuality(request.getPredictedRiceQuality());

      return riceQualityRepository.save(riceQuality);
    } catch (Exception e) {
      throw new RiceQualityException("Error recording rice quality: " + e.getMessage());
    }
  }
}
