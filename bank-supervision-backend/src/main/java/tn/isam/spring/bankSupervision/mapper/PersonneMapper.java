package tn.isam.spring.bankSupervision.mapper;

import tn.isam.spring.bankSupervision.auth.request.RegistrationRequest;
import tn.isam.spring.bankSupervision.entity.User;
import tn.isam.spring.bankSupervision.entity.Admin;
import org.springframework.stereotype.Component;

@Component
public class PersonneMapper {

    // تحويل إلى User
    public User toUser(RegistrationRequest request) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        return user;
    }

    // تحويل إلى Admin
    public Admin toAdmin(RegistrationRequest request) {
        Admin admin = new Admin();
        admin.setEmail(request.getEmail());
        admin.setPassword(request.getPassword());
        return admin;
    }
}