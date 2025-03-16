package com.research.farmer_smart.service;

import com.research.farmer_smart.model.Farmer;
import java.util.List;

public interface NotificationService {
    void notifyFarmersInArea(String location, String pestName, int infestationCount);
    List<Farmer> getFarmersInArea(String location);
} 