package com.research.farmer_smart.repository;

import com.research.farmer_smart.model.PestInfestation;
import com.research.farmer_smart.model.Farmer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface PestInfestationRepository extends MongoRepository<PestInfestation, String> {
    List<PestInfestation> findByFarmer(Farmer farmer);
    List<PestInfestation> findByPestNameContainingIgnoreCase(String pestName);
    List<PestInfestation> findByDetectedLocationAndPestNameAndDetectionDateTimeAfter(
        String location, 
        String pestName, 
        LocalDateTime after
    );
    List<PestInfestation> findByDetectedLocationContainingIgnoreCaseAndDetectionDateTimeAfter(
        String location, 
        LocalDateTime after
    );
    List<PestInfestation> findByFarmerId(String farmerId);
    List<PestInfestation> findByPestNameContaining(String pestName);
    List<PestInfestation> findByDetectedLocationContaining(String location);
    List<PestInfestation> findByLatitudeBetweenAndLongitudeBetween(
        double minLatitude, double maxLatitude,
        double minLongitude, double maxLongitude
    );
} 