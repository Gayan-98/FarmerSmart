package com.research.farmer_smart.service.serviceImpl;

import com.research.farmer_smart.controller.request.WeedSeedDetectionRequest;
import com.research.farmer_smart.exception.FarmerNotFoundException;
import com.research.farmer_smart.exception.WeedSeedException;
import com.research.farmer_smart.model.Farmer;
import com.research.farmer_smart.model.WeedSeedDetection;
import com.research.farmer_smart.repository.FarmerRepository;
import com.research.farmer_smart.repository.WeedSeedDetectionRepository;
import com.research.farmer_smart.service.WeedSeedDetectionService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class WeedSeedDetectionServiceImpl implements WeedSeedDetectionService {

  private final FarmerRepository farmerRepository;
  private final WeedSeedDetectionRepository weedSeedDetectionRepository;

  @Override
  public WeedSeedDetection recordWeedSeedDetection(WeedSeedDetectionRequest request) {
    try {
      Farmer farmer = farmerRepository.findById(request.getFarmerId())
          .orElseThrow(() -> new FarmerNotFoundException(
              "Farmer not found with ID: " + request.getFarmerId()));

      WeedSeedDetection weedSeedDetection = new WeedSeedDetection();
      weedSeedDetection.setFarmer(farmer);
      weedSeedDetection.setTotalSeeds(request.getTotalSeeds());
      weedSeedDetection.setSeedClass(request.getSeedClass());
      weedSeedDetection.setBarnyardgrass(request.getBarnyardgrass());
      weedSeedDetection.setGlume(request.getGlume());
      weedSeedDetection.setJungleRiceA(request.getJungleRiceA());
      weedSeedDetection.setJungleRiceB(request.getJungleRiceB());
      weedSeedDetection.setSaromaccaGrass(request.getSaromaccaGrass());
      weedSeedDetection.setRiceSeeds(request.getRiceSeeds());

      return weedSeedDetectionRepository.save(weedSeedDetection);
    } catch (Exception e) {
      throw new WeedSeedException("Error recording weed seed detection: " + e.getMessage());
    }
  }
}
