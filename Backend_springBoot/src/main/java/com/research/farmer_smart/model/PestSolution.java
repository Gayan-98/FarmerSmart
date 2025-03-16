package com.research.farmer_smart.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "pest_solutions")
public class PestSolution {
    @Id
    private String id;

    @DBRef
    @NotNull
    private Expert expert;

    @DBRef
    @NotNull
    private PestInfestation pestInfestation;

    @NotBlank
    private String solutionDescription;

    @NotNull
    private LocalDateTime insertDateTime;

    @NotBlank
    private String pestName;
} 