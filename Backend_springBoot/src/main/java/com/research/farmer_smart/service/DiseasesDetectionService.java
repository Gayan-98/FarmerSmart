package com.research.farmer_smart.service;

import com.research.farmer_smart.controller.request.DiseasesDetectionRequest;
import com.research.farmer_smart.model.DiseasesDetection;
import java.util.List;

public interface DiseasesDetectionService {

  DiseasesDetection recordDiseasesDetection(DiseasesDetectionRequest request);

  List<DiseasesDetection> getFarmerDiseasesDetection(String farmerId);

  List<DiseasesDetection> searchByDiseaseName(String diseaseName);

  DiseasesDetection getPestInfestationById(String id);
}
