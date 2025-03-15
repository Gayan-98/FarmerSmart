package com.research.farmer_smart.model;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "farmers")
public class Farmer {

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
  @Email
  @Size(max = 60)
  private String email;

  @NotBlank
  private String landSize;

  @NotBlank
  private String landLocation;

  @NotNull
  private LocalDate registrationDate;
}
