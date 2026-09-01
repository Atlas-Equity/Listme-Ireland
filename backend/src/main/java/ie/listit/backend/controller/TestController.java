package ie.listit.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/test")
    public Map<String, String> testBackend() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "The ListMe backend is running perfectly!");
        return response;
    }
}
