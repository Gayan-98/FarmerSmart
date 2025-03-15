package com.research.farmer_smart.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "users")
public class User {

  @Id
  private String id;

  @NotBlank
  @Size(min = 6)
  private String username;

  @NotBlank
  @Size(max = 60)
  private String email;

  @JsonIgnore()
  @NotBlank
  @Size(max = 400)
  private String password;

  private Role role;

  @DBRef
  private Farmer farmer;

  @DBRef
  private Expert expert;
}
