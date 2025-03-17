package com.research.farmer_smart.service;

import com.research.farmer_smart.model.Farmer;

import java.util.List;

public interface DiseaseNotificationService {

    void notifyFarmersInArea(String location, String diseaseName, int infestationCount);
    List<Farmer> getFarmersInArea(String location);
}
