package com.research.farmer_smart.model;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "experts")
public class Expert {

  @Id
  private String id;

  @NotBlank
  @Size(max = 60)
  private String firstName;

  @NotBlank
  @Size(max = 60)
  private String lastName;

  @NotBlank
  @Digits(integer = 10, fraction = 0)
  private String contactNumber;

  @NotBlank
  private String assignedArea;

  @NotBlank
  private String designation;

  @NotNull
  private LocalDate registrationDate;
}
