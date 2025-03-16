package com.research.farmer_smart.service;

import com.research.farmer_smart.controller.request.WeedSeedDetectionRequest;
import com.research.farmer_smart.model.WeedSeedDetection;

public interface WeedSeedDetectionService {

  WeedSeedDetection recordWeedSeedDetection(WeedSeedDetectionRequest request);
}
