package tn.isam.spring.bankSupervision.auth.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RegistrationRequest {

    @NotBlank(message = "VALIDATION.REGISTRATION.NAME.BLANK")
    @Size(
            min = 1,
            max = 50,
            message = "VALIDATION.REGISTRATION.NAME.SIZE"
    )
    @Pattern(
            regexp = "^[\\p{L} '-]+$",
            message = "VALIDATION.REGISTRATION.NAME.PATTERN"
    )
    String name;

    @NotBlank(message = "VALIDATION.REGISTRATION.EMAIL.BLANK")
    @Email(message = "VALIDATION.REGISTRATION.EMAIL.FORMAT")

    String email;

    @NotBlank(message = "VALIDATION.REGISTRATION.PASSWORD.BLANK")
    @Size(min = 8,
            max = 72,
            message = "VALIDATION.REGISTRATION.PASSWORD.SIZE"
    )
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*\\W).*$",
            message = "VALIDATION.REGISTRATION.PASSWORD.WEAK"
    )

    String password;

    private String roleType;

//
//    @NotBlank(message = "VALIDATION.REGISTRATION.CONFIRM_PASSWORD.BLANK")
//    @Size(min = 8,
//            max = 72,
//            message = "VALIDATION.REGISTRATION.CONFIRM_PASSWORD.SIZE"
//    )
//
//    String confirmPassword;
//

}