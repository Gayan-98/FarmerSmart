package com.research.farmer_smart.repository;

import com.research.farmer_smart.model.Farmer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface FarmerRepository extends MongoRepository<Farmer, String> {
    // This will match partial locations more flexibly
    @Query("{ 'landLocation': { $regex: ?0, $options: 'i' } }")
    List<Farmer> findByLandLocationContainingIgnoreCase(String location);
    
    // Add a new method to find farmers by area
    @Query("{ $or: [ " +
           "{ 'landLocation': { $regex: ?0, $options: 'i' } }, " +
           "{ 'landLocation': { $regex: '.*malabe.*', $options: 'i' } } " +
           "] }")
    List<Farmer> findFarmersByArea(String location);
}
