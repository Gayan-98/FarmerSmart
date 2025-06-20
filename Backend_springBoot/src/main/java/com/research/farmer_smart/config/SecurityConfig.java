package com.research.farmer_smart.config;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(AbstractHttpConfigurer::disable)
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/auth/signup", "/auth/login").permitAll()
            .requestMatchers("/api/pest-infestations/**").permitAll()
            .requestMatchers("/diseases-detection/**").permitAll()
            .requestMatchers("/api/pest-solutions/**").permitAll()
            .requestMatchers("/rice-quality/**").permitAll()
            .requestMatchers("/disease-solutions/**").permitAll()
            .requestMatchers("/api/pest-alerts/**").permitAll()
            .requestMatchers("/api/disease-alerts/**").permitAll()
            .requestMatchers("/api/farmers/**").permitAll()
            .requestMatchers("auth/user/**").permitAll()
            .requestMatchers("/weed-seed-detection/**").permitAll()
            .anyRequest().authenticated()
        )
        .sessionManagement(session -> session.sessionCreationPolicy(STATELESS));

    return http.build();
  }
}

