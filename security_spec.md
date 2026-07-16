# Security Specification - EduPulse

## Data Invariants
1. Materials must have a valid subject from the allowed list.
2. Only Mentors can create/update/delete Materials and Courses.
3. Students can only read Materials and Courses.
4. Users can only update their own profile (limited fields).
5. Progress records can only be created/updated by the Student they belong to.
6. Identity fields (uid, mentorId, userId) must match the authenticated user.

## The "Dirty Dozen" Payloads (Rejected)
1. **Identity Spoofing**: Student tries to create a Material as a Mentor.
2. **Role Escalation**: Student tries to change their role to 'Mentor' in their own profile.
3. **Ghost Field Mutation**: Adding `isVerified: true` to a User document.
4. **Orphaned Material**: Creating a Material without a valid subject.
5. **Cross-User Progress**: Student A trying to update the progress of Student B.
6. **Resource Poisoning**: Extremely long title (e.g., 2MB string) in Material.
7. **Bypassing Relation**: Creating a course with a `mentorId` that isn't the current user.
8. **Shadow Update**: Updating a Material's `createdAt` timestamp.
9. **Invalid Subject**: Setting subject to 'Magic'.
10. **Unauthorized Delete**: Student trying to delete a Course.
11. **Malicious ID**: Creating a User with ID `./../malicious`.
12. **PII Leak**: Unauthenticated user trying to read all user profiles.

## Test Runner (Mock Logic)
The tests will verify that all above payloads return `PERMISSION_DENIED`.
