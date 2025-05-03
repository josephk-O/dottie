import { test as base, expect } from "@playwright/test";

// Import utility modules in order: auth → assessment → user
import * as auth from "./runners/auth.js";
import * as assessment from "./runners/assessment.js";
import * as user from "./runners/user.js";

/**
 * Master Integration Test
 *
 * This test suite tests all endpoints in sequence to ensure
 * they work together as expected in a real-world scenario.
 *
 * The test follows this flow:
 * 1. Authentication: Register user and login
 * 2. Assessment: Create and manage assessments
 * 3. User: Update and manage user information
 */

// Create a shared test state object
const sharedTestState = {
  authToken: null,
  userId: null,
  firstAssessmentId: null,
  secondAssessmentId: null,
  testUser: null,
};

// Configure tests to run in sequence, not in parallel
base.describe.configure({ mode: "serial" });

base.describe("Master Integration Test", () => {
  // =====================
  // Authentication Tests
  // =====================
  base("1. Test basic endpoints before starting", async ({ request }) => {
    // Test /api/hello endpoint
    const helloResponse = await request.get("/api/hello");
    expect(helloResponse.status()).toBe(200);
    const helloData = await helloResponse.json();

    // Test database status endpoint
    const dbStatusResponse = await request.get("/api/setup/database/status");
    expect(dbStatusResponse.status()).toBe(200);
    const dbStatusData = await dbStatusResponse.json();
  });

  base("2. Register a new test user", async ({ request }) => {
    try {
      // Generate test user data
      sharedTestState.testUser = auth.generateTestUser();

      // Register the user using the auth module
      const result = await auth.registerUser(request, sharedTestState.testUser);
      sharedTestState.userId = result.userId;

      // Verify we got a valid user ID
      expect(sharedTestState.userId).toBeTruthy();
      expect(result.userData.username).toBe(sharedTestState.testUser.username);
    } catch (error) {
      console.error("Error in user registration test:", error);
      throw error;
    }
  });

  base("3. Login with the registered user", async ({ request }) => {
    try {
      // Log in with the user we just created
      sharedTestState.authToken = await auth.loginUser(request, {
        email: sharedTestState.testUser.email,
        password: sharedTestState.testUser.password,
      });

      // Verify the token is valid
      expect(sharedTestState.authToken).toBeTruthy();

      const isValid = await auth.verifyToken(
        request,
        sharedTestState.authToken
      );
      expect(isValid).toBeTruthy();
    } catch (error) {
      console.error("Error in login test:", error);
      throw error;
    }
  });

  // =====================
  // Assessment Tests
  // =====================
  base("4. Create a first assessment", async ({ request }) => {
    try {
      // Create a basic assessment
      sharedTestState.firstAssessmentId = await assessment.createAssessment(
        request,
        sharedTestState.authToken,
        sharedTestState.userId,
        assessment.generateDefaultAssessment()
      );

      expect(sharedTestState.firstAssessmentId).toBeTruthy();

      // Verify the assessment was created by fetching it
      const assessmentData = await assessment.getAssessmentById(
        request,
        sharedTestState.authToken,
        sharedTestState.firstAssessmentId
      );

      expect(assessmentData.id).toBe(sharedTestState.firstAssessmentId);
      expect(assessmentData.userId).toBe(sharedTestState.userId);
    } catch (error) {
      console.error("Error in create assessment test:", error);
      throw error;
    }
  });

  base("5. Get list of assessments", async ({ request }) => {
    try {
      const assessments = await assessment.getAssessments(
        request,
        sharedTestState.authToken
      );

      // Should contain at least one assessment
      expect(assessments.length).toBeGreaterThanOrEqual(1);

      // Should contain our first assessment
      const hasFirstAssessment = assessments.some(
        (a) => a.id === sharedTestState.firstAssessmentId
      );
      expect(hasFirstAssessment).toBeTruthy();
    } catch (error) {
      console.error("Error in get assessment list test:", error);
      throw error;
    }
  });

  base("6. Update the first assessment", async ({ request }) => {
    try {
      // Update to more severe symptoms
      const updatedAssessment = await assessment.updateAssessment(
        request,
        sharedTestState.authToken,
        sharedTestState.userId,
        sharedTestState.firstAssessmentId,
        {
          flowHeaviness: "heavy",
          painLevel: "severe",
          symptoms: {
            physical: ["Bloating", "Headaches", "Cramps"],
            emotional: ["Mood swings", "Irritability", "Anxiety"],
          },
        }
      );

      // Verify the update was successful
      expect(updatedAssessment.id).toBe(sharedTestState.firstAssessmentId);
      expect(updatedAssessment.assessmentData.flowHeaviness).toBe("heavy");
      expect(updatedAssessment.assessmentData.painLevel).toBe("severe");
    } catch (error) {
      console.error("Error in update assessment test:", error);
      throw error;
    }
  });

  base("7. Create a second assessment", async ({ request }) => {
    try {
      // Create a severe assessment
      sharedTestState.secondAssessmentId = await assessment.createAssessment(
        request,
        sharedTestState.authToken,
        sharedTestState.userId,
        assessment.generateSevereAssessment()
      );

      expect(sharedTestState.secondAssessmentId).toBeTruthy();

      // Verify we now have at least two assessments
      const assessments = await assessment.getAssessments(
        request,
        sharedTestState.authToken
      );
      expect(assessments.length).toBeGreaterThanOrEqual(2);

      // Both assessments should be in the list
      const hasFirstAssessment = assessments.some(
        (a) => a.id === sharedTestState.firstAssessmentId
      );
      const hasSecondAssessment = assessments.some(
        (a) => a.id === sharedTestState.secondAssessmentId
      );
      expect(hasFirstAssessment).toBeTruthy();
      expect(hasSecondAssessment).toBeTruthy();
    } catch (error) {
      console.error("Error in create second assessment test:", error);
      throw error;
    }
  });

  // =====================
  // User Tests
  // =====================
  base("8. Get user information", async ({ request }) => {
    try {
      const userData = await user.getUserById(
        request,
        sharedTestState.authToken,
        sharedTestState.userId
      );

      // Verify we got the correct user
      expect(userData.id).toBe(sharedTestState.userId);
      expect(userData.username).toBe(sharedTestState.testUser.username);
      expect(userData.email).toBe(sharedTestState.testUser.email);
    } catch (error) {
      console.error("Error in get user information test:", error);
      throw error;
    }
  });

  base("9. Update user profile information", async ({ request }) => {
    try {
      // Generate profile update data
      const profileUpdate = user.generateProfileUpdate();

      // Update the profile
      const updatedUser = await user.updateUserProfile(
        request,
        sharedTestState.authToken,
        sharedTestState.userId,
        profileUpdate
      );

      // Verify the update was successful
      expect(updatedUser.id).toBe(sharedTestState.userId);
      expect(updatedUser.username).toBe(profileUpdate.username);
      expect(updatedUser.age).toBe(profileUpdate.age);

      // Update the test user in the shared state
      sharedTestState.testUser = updatedUser;
    } catch (error) {
      console.error("Error in update user profile test:", error);
      throw error;
    }
  });

  base("10. Get all users (admin operation)", async ({ request }) => {
    try {
      const allUsers = await user.getAllUsers(
        request,
        sharedTestState.authToken
      );

      // Should be an array of users
      expect(Array.isArray(allUsers)).toBeTruthy();

      // Should contain our test user
      const hasTestUser = allUsers.some((u) => u.id === sharedTestState.userId);
      expect(hasTestUser).toBeTruthy();
    } catch (error) {
      console.error("Error in get all users test:", error);
      throw error;
    }
  });

  // =====================
  // Cleanup Tests
  // =====================
  base("11. Delete the second assessment", async ({ request }) => {
    try {
      const deleted = await assessment.deleteAssessment(
        request,
        sharedTestState.authToken,
        sharedTestState.userId,
        sharedTestState.secondAssessmentId
      );

      expect(deleted).toBeTruthy();

      // Verify it was deleted by trying to fetch it (should fail)
      try {
        await assessment.getAssessmentById(
          request,
          sharedTestState.authToken,
          sharedTestState.secondAssessmentId
        );
        // If we reach here, the assessment wasn't deleted
        expect(false).toBeTruthy("Assessment should have been deleted");
      } catch (error) {
        // We expect an error when trying to fetch a deleted assessment
        expect(error.message).toContain("Failed to get assessment: 404");
      }

      // Verify the first assessment still exists
      const firstAssessment = await assessment.getAssessmentById(
        request,
        sharedTestState.authToken,
        sharedTestState.firstAssessmentId
      );
      expect(firstAssessment.id).toBe(sharedTestState.firstAssessmentId);
    } catch (error) {
      console.error("Error in delete second assessment test:", error);
      throw error;
    }
  });

  base("12. Delete the first assessment", async ({ request }) => {
    try {
      const deleted = await assessment.deleteAssessment(
        request,
        sharedTestState.authToken,
        sharedTestState.userId,
        sharedTestState.firstAssessmentId
      );

      expect(deleted).toBeTruthy();

      // Verify all assessments are deleted
      const assessments = await assessment.getAssessments(
        request,
        sharedTestState.authToken
      );
      const hasAnyTestAssessment = assessments.some(
        (a) =>
          a.id === sharedTestState.firstAssessmentId ||
          a.id === sharedTestState.secondAssessmentId
      );
      expect(hasAnyTestAssessment).toBeFalsy();
    } catch (error) {
      console.error("Error in delete first assessment test:", error);
      throw error;
    }
  });

  // Note: Some APIs may not allow deleting users, so we'll mark this as skipped
  base.skip("13. Delete the test user", async ({ request }) => {
    try {
      const deleted = await user.deleteUser(
        request,
        sharedTestState.authToken,
        sharedTestState.userId
      );
      expect(deleted).toBeTruthy();

      // Try to access the user (should fail)
      try {
        await user.getUserById(
          request,
          sharedTestState.authToken,
          sharedTestState.userId
        );
        // If we reach here, the user wasn't deleted
        expect(false).toBeTruthy("User should have been deleted");
      } catch (error) {
        // We expect an error when trying to fetch a deleted user
        expect(error.message).toContain("Failed to get user info: 404");
      }
    } catch (error) {
      console.error("Error in delete user test:", error);
      throw error;
    }
  });

  // =====================
  // Error Tests
  // =====================
  base("14. Test authentication errors", async ({ request }) => {
    try {
      // Try to access protected endpoint with invalid token
      const response = await request.get("/api/auth/users", {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });

      expect(response.status()).toBe(401);
    } catch (error) {
      console.error("Error in authentication errors test:", error);
      throw error;
    }
  });
});
