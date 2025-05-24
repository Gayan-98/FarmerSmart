package com.research.farmer_smart.service.serviceImpl;

import com.research.farmer_smart.controller.request.DiseasesDetectionRequest;
import com.research.farmer_smart.exception.DiseasesDetectionException;
import com.research.farmer_smart.exception.FarmerNotFoundException;
import com.research.farmer_smart.model.DiseasesDetection;
import com.research.farmer_smart.model.Farmer;
import com.research.farmer_smart.model.PestInfestation;
import com.research.farmer_smart.repository.DiseasesDetectionRepository;
import com.research.farmer_smart.repository.FarmerRepository;
import com.research.farmer_smart.service.DiseasesDetectionService;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@AllArgsConstructor
public class DiseasesDetectionServiceImpl implements DiseasesDetectionService {

  private final FarmerRepository farmerRepository;
  private final DiseasesDetectionRepository diseasesDetectionRepository;

  @Override
  public DiseasesDetection recordDiseasesDetection(DiseasesDetectionRequest request) {
    try {
      Farmer farmer = farmerRepository.findById(request.getFarmerId())
          .orElseThrow(() -> new FarmerNotFoundException(
              "Farmer not found with ID: " + request.getFarmerId()));

      DiseasesDetection diseasesDetection = new DiseasesDetection();
      diseasesDetection.setFarmer(farmer);
      diseasesDetection.setDiseaseName(request.getDiseaseName());
      diseasesDetection.setDetectedLocation(request.getDetectedLocation());
      diseasesDetection.setDetectionDateTime(request.getDetectionDateTime());

      return diseasesDetectionRepository.save(diseasesDetection);
    } catch (Exception e) {
      throw new DiseasesDetectionException("Error recording diseases detection: " + e.getMessage());
    }
  }

  @Override
  public List<DiseasesDetection> getFarmerDiseasesDetection(String farmerId) {
    Farmer farmer = farmerRepository.findById(farmerId)
        .orElseThrow(() -> new FarmerNotFoundException("Farmer not found"));
    return diseasesDetectionRepository.findByFarmer(farmer);
  }

  @Override
  public List<DiseasesDetection> searchByDiseaseName(String diseaseName) {
    return diseasesDetectionRepository.findByDiseaseName(diseaseName);
  }

  @Override
  public DiseasesDetection getPestInfestationById(String id) {
    return diseasesDetectionRepository.findById(id)
        .orElseThrow(() -> new DiseasesDetectionException(" disease detection record not found"));
  }

  @Override
  public List<DiseasesDetection> searchByLocation(String location) {
    LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
    return diseasesDetectionRepository.findByDetectedLocationContainingIgnoreCaseAndDetectionDateTimeAfter(
            location,
            oneWeekAgo
    );
  }


  @Override
  public List<DiseasesDetection> getAllDisease() {

    return diseasesDetectionRepository.findAll();
  }


}
