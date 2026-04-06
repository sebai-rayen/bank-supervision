package tn.isam.spring.bankSupervision.controller;

import org.springframework.web.bind.annotation.*;
import tn.isam.spring.bankSupervision.service.PersonneService;

@RestController
@RequestMapping("/personne")
public class PersonneController {

    public PersonneController(PersonneService personneService) {
    }

}
