package com.example.backend.service;

import com.example.backend.dto.IssueCreateRequest;
import com.example.backend.dto.IssueDetailResponse;
import com.example.backend.dto.IssueReplyRequest;
import com.example.backend.dto.IssueResponseDto;
import com.example.backend.dto.IssueStatusUpdateRequest;
import com.example.backend.entity.HostelBasicInfo;
import com.example.backend.entity.Issue;
import com.example.backend.entity.IssueAttachment;
import com.example.backend.entity.IssuePriority;
import com.example.backend.entity.IssueResponse;
import com.example.backend.entity.IssueStatus;
import com.example.backend.entity.IssueStatusHistory;
import com.example.backend.entity.User;
import com.example.backend.repository.HostelRepository;
import com.example.backend.repository.IssueAttachmentRepository;
import com.example.backend.repository.IssueRepository;
import com.example.backend.repository.IssueResponseRepository;
import com.example.backend.repository.IssueStatusHistoryRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class IssueServiceImpl implements IssueService {

    private final IssueRepository issueRepository;

    private final IssueResponseRepository issueResponseRepository;

    private final IssueStatusHistoryRepository issueStatusHistoryRepository;

    private final IssueAttachmentRepository issueAttachmentRepository;

    private final UserRepository userRepository;

    private final HostelRepository hostelRepository;


    /*
     * =========================================================
     * CREATE ISSUE
     * =========================================================
     */
    @Override
    public IssueResponseDto createIssue(
            IssueCreateRequest request,
            MultipartFile file,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        if (request == null) {
            throw new RuntimeException("Issue request is required.");
        }

        if (request.getHostelId() == null) {
            throw new RuntimeException("Hostel ID is required.");
        }

        if (request.getCategory() == null ||
                request.getCategory().trim().isEmpty()) {

            throw new RuntimeException(
                    "Issue category is required."
            );
        }

        if (request.getSubject() == null ||
                request.getSubject().trim().isEmpty()) {

            throw new RuntimeException(
                    "Issue subject is required."
            );
        }

        if (request.getDescription() == null ||
                request.getDescription().trim().isEmpty()) {

            throw new RuntimeException(
                    "Issue description is required."
            );
        }

        HostelBasicInfo hostel =
                hostelRepository.findById(
                        request.getHostelId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Hostel not found."
                        )
                );

        Issue issue = new Issue();

        issue.setUser(user);

        issue.setHostel(hostel);

        issue.setCategory(
                request.getCategory().trim()
        );

        issue.setSubject(
                request.getSubject().trim()
        );

        issue.setDescription(
                request.getDescription().trim()
        );

        issue.setPriority(
                request.getPriority() != null
                        ? request.getPriority()
                        : IssuePriority.MEDIUM
        );

        issue.setStatus(
                IssueStatus.OPEN
        );

        issue.setCreatedAt(
                LocalDateTime.now()
        );

        issue.setUpdatedAt(
                LocalDateTime.now()
        );

        Issue savedIssue =
                issueRepository.save(issue);


        /*
         * =====================================================
         * OPTIONAL ATTACHMENT
         * =====================================================
         */
        if (file != null && !file.isEmpty()) {

            saveAttachment(
                    savedIssue,
                    file
            );
        }


        /*
         * =====================================================
         * INITIAL STATUS HISTORY
         * =====================================================
         */
        saveStatusHistory(
                savedIssue,
                IssueStatus.OPEN,
                user
        );

        return toResponseDto(savedIssue);
    }


    /*
     * =========================================================
     * USER - GET MY ISSUES FOR HOSTEL
     * =========================================================
     */
    @Override
    @Transactional(readOnly = true)
    public List<IssueResponseDto> getMyIssuesForHostel(
            Long hostelId,
            Authentication authentication) {

        User user =
                getAuthenticatedUser(authentication);

        if (hostelId == null) {
            throw new RuntimeException(
                    "Hostel ID is required."
            );
        }

        return issueRepository
                .findByUserIdAndHostelHostelIdOrderByCreatedAtDesc(
                        user.getId(),
                        hostelId
                )
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }


    /*
     * =========================================================
     * USER - APPROVE OWNER RESOLUTION
     * =========================================================
     */
    @Override
    public IssueResponseDto userApproveResolution(
            Long issueId,
            Authentication authentication) {

        User user =
                getAuthenticatedUser(authentication);

        Issue issue =
                issueRepository.findById(issueId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Issue not found."
                                )
                        );


        /*
         * Only the user who originally reported the issue
         * can approve the resolution.
         */
        if (issue.getUser() == null ||
                !issue.getUser().getId().equals(user.getId())) {

            throw new RuntimeException(
                    "You are not authorized to approve this issue."
            );
        }


        /*
         * User can approve only when the owner has
         * submitted the issue as RESOLVED.
         */
        if (issue.getStatus() != IssueStatus.RESOLVED) {

            throw new RuntimeException(
                    "This issue is not waiting for resolution approval."
            );
        }


        /*
         * Record user's confirmation in the conversation.
         */
        IssueResponse response =
                new IssueResponse();

        response.setIssue(issue);

        response.setUser(user);

        response.setMessage(
                "User confirmed that the issue has been resolved."
        );

        response.setCreatedAt(
                LocalDateTime.now()
        );

        response.setResponderType(
                "USER"
        );

        issueResponseRepository.save(response);


        /*
         * User approved the resolution.
         * The issue is now CLOSED.
         */
        issue.setStatus(
                IssueStatus.CLOSED
        );

        if (issue.getResolvedAt() == null) {

            issue.setResolvedAt(
                    LocalDateTime.now()
            );
        }

        issue.setUpdatedAt(
                LocalDateTime.now()
        );

        issueRepository.save(issue);

        saveStatusHistory(
                issue,
                IssueStatus.CLOSED,
                user
        );

        return toResponseDto(issue);
    }


    /*
     * =========================================================
     * USER - REJECT OWNER RESOLUTION
     * =========================================================
     */
    @Override
    public IssueResponseDto userRejectResolution(
            Long issueId,
            Authentication authentication) {

        User user =
                getAuthenticatedUser(authentication);

        Issue issue =
                issueRepository.findById(issueId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Issue not found."
                                )
                        );


        /*
         * Only the user who originally reported the issue
         * can reject the resolution.
         */
        if (issue.getUser() == null ||
                !issue.getUser().getId().equals(user.getId())) {

            throw new RuntimeException(
                    "You are not authorized to reject this issue."
            );
        }


        /*
         * User can reject only when the owner has
         * marked the issue as RESOLVED.
         */
        if (issue.getStatus() != IssueStatus.RESOLVED) {

            throw new RuntimeException(
                    "This issue is not waiting for resolution approval."
            );
        }


        /*
         * Record user's rejection in the conversation.
         */
        IssueResponse response =
                new IssueResponse();

        response.setIssue(issue);

        response.setUser(user);

        response.setMessage(
                "User reported that the issue has not been resolved."
        );

        response.setCreatedAt(
                LocalDateTime.now()
        );

        response.setResponderType(
                "USER"
        );

        issueResponseRepository.save(response);


        /*
         * Put the issue back into OPEN state so the owner
         * receives it again.
         */
        issue.setStatus(
                IssueStatus.OPEN
        );

        issue.setResolvedAt(null);

        issue.setUpdatedAt(
                LocalDateTime.now()
        );

        issueRepository.save(issue);

        saveStatusHistory(
                issue,
                IssueStatus.OPEN,
                user
        );

        return toResponseDto(issue);
    }


    /*
     * =========================================================
     * USER - ISSUE DETAILS
     * =========================================================
     */
    @Override
    @Transactional(readOnly = true)
    public IssueDetailResponse getIssueDetails(
            Long issueId,
            Authentication authentication) {

        User user =
                getAuthenticatedUser(authentication);

        Issue issue =
                issueRepository.findById(issueId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Issue not found."
                                )
                        );

        if (!issue.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not authorized to view this issue."
            );
        }

        return toDetailResponse(issue);
    }


    /*
     * =========================================================
     * OWNER - GET ISSUES
     * =========================================================
     */
    @Override
    @Transactional(readOnly = true)
    public List<IssueResponseDto> getOwnerIssues(
            Authentication authentication) {

        User owner =
                getAuthenticatedUser(authentication);

        return issueRepository
                .findByHostelOwnerIdOrderByCreatedAtDesc(
                        owner.getId()
                )
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }


    /*
     * =========================================================
     * OWNER - ISSUE DETAILS
     * =========================================================
     */
    @Override
    @Transactional(readOnly = true)
    public IssueDetailResponse getOwnerIssueDetails(
            Long issueId,
            Authentication authentication) {

        User owner =
                getAuthenticatedUser(authentication);

        Issue issue =
                issueRepository.findById(issueId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Issue not found."
                                )
                        );

        validateOwnerAccess(
                issue,
                owner
        );

        return toDetailResponse(issue);
    }


    /*
     * =========================================================
     * OWNER - REPLY
     * =========================================================
     */
    @Override
    public IssueResponseDto ownerReply(
            Long issueId,
            IssueReplyRequest request,
            Authentication authentication) {

        User owner =
                getAuthenticatedUser(authentication);

        Issue issue =
                issueRepository.findById(issueId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Issue not found."
                                )
                        );

        validateOwnerAccess(
                issue,
                owner
        );

        if (request == null ||
                request.getMessage() == null ||
                request.getMessage().trim().isEmpty()) {

            throw new RuntimeException(
                    "Response message is required."
            );
        }

        IssueResponse response =
                new IssueResponse();

        response.setIssue(issue);

        response.setUser(owner);

        response.setMessage(
                request.getMessage().trim()
        );

        response.setCreatedAt(
                LocalDateTime.now()
        );

        response.setResponderType(
                "OWNER"
        );

        issueResponseRepository.save(
                response
        );

        issue.setStatus(
                IssueStatus.OWNER_RESPONDED
        );

        issue.setUpdatedAt(
                LocalDateTime.now()
        );

        issueRepository.save(issue);

        saveStatusHistory(
                issue,
                IssueStatus.OWNER_RESPONDED,
                owner
        );

        return toResponseDto(issue);
    }


    /*
     * =========================================================
     * OWNER - UPDATE STATUS
     * =========================================================
     */
    @Override
    public IssueResponseDto ownerUpdateStatus(
            Long issueId,
            IssueStatusUpdateRequest request,
            Authentication authentication) {

        User owner =
                getAuthenticatedUser(authentication);

        Issue issue =
                issueRepository.findById(issueId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Issue not found."
                                )
                        );

        validateOwnerAccess(
                issue,
                owner
        );

        if (request == null ||
                request.getStatus() == null) {

            throw new RuntimeException(
                    "Status is required."
            );
        }

        IssueStatus newStatus =
                request.getStatus();

        issue.setStatus(newStatus);

        issue.setUpdatedAt(
                LocalDateTime.now()
        );

        issueRepository.save(issue);

        saveStatusHistory(
                issue,
                newStatus,
                owner
        );

        return toResponseDto(issue);
    }


    /*
     * =========================================================
     * ADMIN - GET ALL
     * =========================================================
     */
    @Override
    @Transactional(readOnly = true)
    public List<IssueResponseDto> getAllAdminIssues() {

        return issueRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }


    /*
     * =========================================================
     * ADMIN - DETAILS
     * =========================================================
     */
    @Override
    @Transactional(readOnly = true)
    public IssueDetailResponse getAdminIssueDetails(
            Long issueId) {

        Issue issue =
                issueRepository.findById(issueId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Issue not found."
                                )
                        );

        return toDetailResponse(issue);
    }


    /*
     * =========================================================
     * ADMIN - REPLY
     * =========================================================
     */
    @Override
    public IssueResponseDto adminReply(
            Long issueId,
            IssueReplyRequest request,
            Authentication authentication) {

        User admin =
                getAuthenticatedUser(authentication);

        Issue issue =
                issueRepository.findById(issueId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Issue not found."
                                )
                        );

        if (request == null ||
                request.getMessage() == null ||
                request.getMessage().trim().isEmpty()) {

            throw new RuntimeException(
                    "Response message is required."
            );
        }

        IssueResponse response =
                new IssueResponse();

        response.setIssue(issue);

        response.setUser(admin);

        response.setMessage(
                request.getMessage().trim()
        );

        response.setCreatedAt(
                LocalDateTime.now()
        );

        response.setResponderType(
                "ADMIN"
        );

        issueResponseRepository.save(
                response
        );

        issue.setStatus(
                IssueStatus.ADMIN_REVIEW
        );

        issue.setUpdatedAt(
                LocalDateTime.now()
        );

        issueRepository.save(issue);

        saveStatusHistory(
                issue,
                IssueStatus.ADMIN_REVIEW,
                admin
        );

        return toResponseDto(issue);
    }


    /*
     * =========================================================
     * ADMIN - UPDATE STATUS
     * =========================================================
     */
    @Override
    public IssueResponseDto adminUpdateStatus(
            Long issueId,
            IssueStatusUpdateRequest request,
            Authentication authentication) {

        User admin =
                getAuthenticatedUser(authentication);

        Issue issue =
                issueRepository.findById(issueId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Issue not found."
                                )
                        );

        if (request == null ||
                request.getStatus() == null) {

            throw new RuntimeException(
                    "Status is required."
            );
        }

        IssueStatus newStatus =
                request.getStatus();

        issue.setStatus(
                newStatus
        );

        issue.setUpdatedAt(
                LocalDateTime.now()
        );

        if (newStatus == IssueStatus.RESOLVED ||
                newStatus == IssueStatus.CLOSED) {

            issue.setResolvedAt(
                    LocalDateTime.now()
            );
        }

        issueRepository.save(issue);

        saveStatusHistory(
                issue,
                newStatus,
                admin
        );

        return toResponseDto(issue);
    }


    /*
     * =========================================================
     * AUTHENTICATED USER
     * =========================================================
     */
    private User getAuthenticatedUser(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated."
            );
        }

        String email =
                authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found."
                        )
                );
    }


    /*
     * =========================================================
     * OWNER ACCESS
     * =========================================================
     */
    private void validateOwnerAccess(
            Issue issue,
            User owner) {

        if (issue.getHostel() == null ||
                issue.getHostel().getOwner() == null ||
                !issue.getHostel()
                        .getOwner()
                        .getId()
                        .equals(owner.getId())) {

            throw new RuntimeException(
                    "You are not authorized to access this issue."
            );
        }
    }


    /*
     * =========================================================
     * STATUS HISTORY
     * =========================================================
     */
    private void saveStatusHistory(
            Issue issue,
            IssueStatus status,
            User changedBy) {

        IssueStatusHistory history =
                new IssueStatusHistory();

        history.setIssue(issue);

        history.setStatus(status);

        history.setChangedBy(changedBy);

        history.setChangedAt(
                LocalDateTime.now()
        );

        issueStatusHistoryRepository.save(
                history
        );
    }


    /*
     * =========================================================
     * ATTACHMENT
     * =========================================================
     */
    private void saveAttachment(
            Issue issue,
            MultipartFile file) {

        try {

            if (file.getContentType() == null ||
                    !file.getContentType()
                            .toLowerCase()
                            .startsWith("image/")) {

                throw new RuntimeException(
                        "Only image files are allowed."
                );
            }

            if (file.getSize() >
                    10 * 1024 * 1024) {

                throw new RuntimeException(
                        "Image size cannot exceed 10 MB."
                );
            }

            String originalName =
                    file.getOriginalFilename();

            String extension = "";

            if (originalName != null &&
                    originalName.contains(".")) {

                extension =
                        originalName.substring(
                                originalName.lastIndexOf(".")
                        );
            }

            String storedFileName =
                    UUID.randomUUID()
                            + extension;

            Path uploadDirectory =
                    Paths.get("uploads/issues")
                            .toAbsolutePath()
                            .normalize();

            Files.createDirectories(
                    uploadDirectory
            );

            Path target =
                    uploadDirectory.resolve(
                            storedFileName
                    );

            Files.copy(
                    file.getInputStream(),
                    target,
                    StandardCopyOption.REPLACE_EXISTING
            );

            IssueAttachment attachment =
                    new IssueAttachment();

            attachment.setIssue(issue);

            attachment.setOriginalFileName(
                    originalName
            );

            attachment.setFileName(
                    storedFileName
            );

            /*
             * Keep the REAL filesystem path in the database.
             */
            attachment.setFilePath(
                    target.toString()
            );

            attachment.setFileType(
                    file.getContentType()
            );

            attachment.setFileSize(
                    file.getSize()
            );

            attachment.setUploadedAt(
                    LocalDateTime.now()
            );

            issueAttachmentRepository.save(
                    attachment
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to save issue attachment.",
                    e
            );
        }
    }


    /*
     * =========================================================
     * BASIC RESPONSE DTO
     * =========================================================
     */
    private IssueResponseDto toResponseDto(
            Issue issue) {

        return IssueResponseDto.builder()

                .id(
                        issue.getId()
                )

                .hostelId(
                        issue.getHostel() != null
                                ? issue.getHostel()
                                    .getHostelId()
                                : null
                )

                .hostelName(
                        issue.getHostel() != null
                                ? issue.getHostel()
                                    .getHostelName()
                                : null
                )

                .userId(
                        issue.getUser() != null
                                ? issue.getUser()
                                    .getId()
                                : null
                )

                .userName(
                        issue.getUser() != null
                                ? issue.getUser()
                                    .getName()
                                : null
                )

                .category(
                        issue.getCategory()
                )

                .subject(
                        issue.getSubject()
                )

                .description(
                        issue.getDescription()
                )

                .priority(
                        issue.getPriority()
                )

                .status(
                        issue.getStatus()
                )

                .createdAt(
                        issue.getCreatedAt()
                )

                .updatedAt(
                        issue.getUpdatedAt()
                )

                .resolvedAt(
                        issue.getResolvedAt()
                )

                .build();
    }


    /*
     * =========================================================
     * DETAIL RESPONSE
     * =========================================================
     */
    private IssueDetailResponse toDetailResponse(
            Issue issue) {

        /*
         * =====================================================
         * ALL RESPONSE MESSAGES
         *
         * Keep every response in chronological order.
         * This includes:
         *
         * USER
         * OWNER
         * ADMIN
         *
         * Nothing is removed here.
         * =====================================================
         */
        List<IssueResponseDto> responses =
                issueResponseRepository
                        .findByIssueIdOrderByCreatedAtAsc(
                                issue.getId()
                        )
                        .stream()
                        .map(response ->
                                IssueResponseDto.builder()

                                        .id(
                                                response.getId()
                                        )

                                        .hostelId(
                                                issue.getHostel()
                                                        .getHostelId()
                                        )

                                        .hostelName(
                                                issue.getHostel()
                                                        .getHostelName()
                                        )

                                        .userId(
                                                response.getUser() != null
                                                        ? response.getUser()
                                                            .getId()
                                                        : null
                                        )

                                        .userName(
                                                response.getUser() != null
                                                        ? response.getUser()
                                                            .getName()
                                                        : null
                                        )

                                        .message(
                                                response.getMessage()
                                        )

                                        .responderType(
                                                response.getResponderType()
                                        )

                                        .createdAt(
                                                response.getCreatedAt()
                                        )

                                        .build()
                        )
                        .collect(Collectors.toList());


        /*
         * =====================================================
         * ISSUE ATTACHMENTS
         *
         * Load all images uploaded by the user for this issue.
         * =====================================================
         */
        List<IssueDetailResponse.IssueAttachmentDto> attachments =
                issueAttachmentRepository
                        .findByIssueIdOrderByUploadedAtAsc(
                                issue.getId()
                        )
                        .stream()
                        .map(attachment -> {

                            /*
                             * IMPORTANT:
                             *
                             * filePath in the database remains the
                             * actual filesystem path.
                             *
                             * But the value returned to React is
                             * changed into a browser-accessible URL.
                             */
                            String imageUrl =
                                    "/uploads/issues/"
                                            + attachment.getFileName();

                            return IssueDetailResponse.IssueAttachmentDto
                                    .builder()

                                    .id(
                                            attachment.getId()
                                    )

                                    .originalFileName(
                                            attachment.getOriginalFileName()
                                    )

                                    .fileName(
                                            attachment.getFileName()
                                    )

                                    /*
                                     * Return browser URL here.
                                     *
                                     * React will convert this to:
                                     * http://localhost:8080/uploads/issues/...
                                     */
                                    .filePath(
                                            imageUrl
                                    )

                                    .fileType(
                                            attachment.getFileType()
                                    )

                                    .fileSize(
                                            attachment.getFileSize()
                                    )

                                    .uploadedAt(
                                            attachment.getUploadedAt()
                                    )

                                    .build();
                        })
                        .collect(Collectors.toList());


        /*
         * =====================================================
         * FINAL DETAIL RESPONSE
         * =====================================================
         */
        return IssueDetailResponse.builder()

                .id(
                        issue.getId()
                )

                .hostelId(
                        issue.getHostel()
                                .getHostelId()
                )

                .hostelName(
                        issue.getHostel()
                                .getHostelName()
                )

                .userId(
                        issue.getUser()
                                .getId()
                )

                .userName(
                        issue.getUser()
                                .getName()
                )

                .category(
                        issue.getCategory()
                )

                .subject(
                        issue.getSubject()
                )

                .description(
                        issue.getDescription()
                )

                .priority(
                        issue.getPriority()
                )

                .status(
                        issue.getStatus()
                )

                .createdAt(
                        issue.getCreatedAt()
                )

                .updatedAt(
                        issue.getUpdatedAt()
                )

                .resolvedAt(
                        issue.getResolvedAt()
                )

                /*
                 * ALL response messages remain here.
                 */
                .responses(
                        responses
                )

                /*
                 * ALL issue images remain here.
                 */
                .attachments(
                        attachments
                )

                .build();
    }
}