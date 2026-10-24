package com.example.backend.controller;


import com.example.backend.dto.HostelRulesRequest;
import com.example.backend.dto.HostelRulesResponse;
import com.example.backend.service.HostelRulesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/owner/hostels")
@RequiredArgsConstructor
public class HostelRulesController {


   private final HostelRulesService hostelRulesService;


   @PutMapping("/{hostelId}/rules")
   public ResponseEntity<HostelRulesResponse> saveOrUpdateRules(
           @PathVariable Long hostelId,
           @Valid @RequestBody HostelRulesRequest request
   ) {


       HostelRulesResponse response =
               hostelRulesService.saveOrUpdateRules(
                       hostelId,
                       request
               );


       return ResponseEntity
               .status(HttpStatus.OK)
               .body(response);
   }


   @GetMapping("/{hostelId}/rules")
   public ResponseEntity<HostelRulesResponse> getRules(
           @PathVariable Long hostelId
   ) {


       HostelRulesResponse response =
               hostelRulesService.getRules(hostelId);


       return ResponseEntity.ok(response);
   }
}




