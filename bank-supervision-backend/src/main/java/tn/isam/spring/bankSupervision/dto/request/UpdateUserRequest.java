package tn.isam.spring.bankSupervision.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserRequest {

    @Size(min = 1, max = 50, message = "VALIDATION.REGISTRATION.NAME.SIZE")
    @Pattern(regexp = "^[\\p{L} '-]+$", message = "VALIDATION.REGISTRATION.NAME.PATTERN")
    private String nom;

    @Email(message = "VALIDATION.REGISTRATION.EMAIL.FORMAT")
    private String email;

    private Boolean active;
}
