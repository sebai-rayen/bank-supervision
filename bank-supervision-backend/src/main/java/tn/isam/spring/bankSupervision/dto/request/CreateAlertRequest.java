package tn.isam.spring.bankSupervision.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateAlertRequest {

    @NotBlank(message = "Le serveur est obligatoire")
    private String server;

    @NotBlank(message = "Le destinataire est obligatoire")
    @Email(message = "L'email du destinataire est invalide")
    private String recipientEmail;

    @NotBlank(message = "Le type est obligatoire")
    private String type;

    @NotBlank(message = "La severite est obligatoire")
    private String severity;

    @NotBlank(message = "Le sujet est obligatoire")
    private String subject;

    @NotBlank(message = "Le message est obligatoire")
    private String message;
}
