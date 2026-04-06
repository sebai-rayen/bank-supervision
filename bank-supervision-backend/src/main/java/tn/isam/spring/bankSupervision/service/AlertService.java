package tn.isam.spring.bankSupervision.service;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import tn.isam.spring.bankSupervision.entity.User;
import tn.isam.spring.bankSupervision.repository.AlertRepository;
import tn.isam.spring.bankSupervision.repository.UserRepository;

import java.util.List;

@Service
@AllArgsConstructor // constructeur bil parameter
public class AlertService {
    private final AlertRepository repository;
    private final UserRepository userRepository;

public List<User> getPersonne(){
    return userRepository.findAll();
}
    // A3mil fonctionetik lina
}
