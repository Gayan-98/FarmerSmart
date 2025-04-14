package com.research.farmer_smart.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "pest_infestations")
public class PestInfestation {
    @Id
    private String id;

    @DBRef
    @NotNull
    private Farmer farmer;

    @NotBlank
    private String pestName;

    @NotBlank
    private String detectedLocation;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    @NotNull
    private LocalDateTime detectionDateTime;
} 