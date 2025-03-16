package com.research.farmer_smart.exception;

import com.research.farmer_smart.controller.response.ErrorResponse;
import com.research.farmer_smart.controller.response.LoginResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.validation.FieldError;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<LoginResponse> handleInvalidCredentialsException(InvalidCredentialsException ex) {
        LoginResponse response = LoginResponse.builder()
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        ErrorResponse response = new ErrorResponse("Validation failed: " + errors);
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(PestInfestationException.class)
    public ResponseEntity<ErrorResponse> handlePestInfestationException(PestInfestationException e) {
        ErrorResponse error = new ErrorResponse(e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception e) {
        ErrorResponse error = new ErrorResponse("An unexpected error occurred: " + e.getMessage());
        return ResponseEntity.internalServerError().body(error);
    }
} 