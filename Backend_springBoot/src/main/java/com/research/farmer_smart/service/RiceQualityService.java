package com.research.farmer_smart.service;

import com.research.farmer_smart.controller.request.RiceQualityRequest;
import com.research.farmer_smart.model.RiceQuality;

public interface RiceQualityService {

  RiceQuality recordRiceQuality(RiceQualityRequest request);
}
