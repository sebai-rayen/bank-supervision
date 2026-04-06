package tn.isam.spring.bankSupervision.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import tn.isam.spring.bankSupervision.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

}


