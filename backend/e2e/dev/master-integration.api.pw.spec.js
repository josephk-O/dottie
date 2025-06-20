import { test as base, expect } from "@playwright/test";

// Import high-level scenario workflows (using dev scenarios with granular functions)
import * as scenarios from "./runners/scenarios/index.js";
import { AuthenticatedRequestContext } from "./runners/utils/authRequestContext.js";

/**
 * Master Integration Test for Development
 *
 * This test suite runs complete workflow scenarios to ensure
 * all endpoints work together in real-world usage patterns.
 * Note: ALL conversations require an assessment_id - there is no distinction
 * between conversations with and without assessments.
 */

// Create a shared test state object
const sharedTestState = {
  requestContext: null,
  authToken: null,
  userId: null,
  firstAssessmentId: null,
  secondAssessmentId: null,
  testUser: null,
  firstConversationId: null,
  secondConversationId: null,
};

// Configure tests to run in sequence, not in parallel
base.describe.configure({ mode: "serial" });

base.describe("Master Integration Test", () => {

    base.beforeAll(async () => {
    // Create the shared request context once before all tests
    sharedTestState.requestContext = await AuthenticatedRequestContext();
  });


  base("1. Complete setup workflow", async () => {
    await scenarios.runSetupWorkflow(sharedTestState.requestContext, expect);
  });

  base("2. Complete authentication workflow", async () => {
    const authResult = await scenarios.runAuthWorkflow(sharedTestState.requestContext, expect);
    
    // Store results for subsequent tests
    sharedTestState.testUser = authResult.testUser;
    sharedTestState.userId = authResult.userId;
    sharedTestState.authToken = authResult.authToken;
  });

  base("3. Assessment creation and management workflow", async () => {
    const { firstAssessmentId, secondAssessmentId } = await scenarios.runAssessmentCreationWorkflow(
      sharedTestState.requestContext, 
      expect, 
      sharedTestState.authToken, 
      sharedTestState.userId
    );
    
    // Store assessment IDs for subsequent chat tests and cleanup
    sharedTestState.firstAssessmentId = firstAssessmentId;
    sharedTestState.secondAssessmentId = secondAssessmentId;
  });

  base("4. User management workflow", async () => {
    const updatedUser = await scenarios.runUserManagementWorkflow(
      sharedTestState.requestContext,
      expect,
      sharedTestState.authToken,
      sharedTestState.userId,
      sharedTestState.testUser
    );
    
    // Update test user data
    sharedTestState.testUser = updatedUser;
  });

  base("5. First chat conversation workflow with assessment", async () => {
    const conversationId = await scenarios.runChatWithAssessmentWorkflow(
      sharedTestState.requestContext,
      expect,
      sharedTestState.authToken,
      sharedTestState.firstAssessmentId
    );
    
    // Store conversation ID for cleanup
    sharedTestState.firstConversationId = conversationId;
  });

  base("6. Second chat conversation workflow with different assessment", async () => {
    // Create second assessment if it's the same as the first (for testing multiple conversations)
    let assessmentIdToUse = sharedTestState.secondAssessmentId;
    if (sharedTestState.firstAssessmentId === sharedTestState.secondAssessmentId) {
      // Create a new assessment for the second conversation
      const { firstAssessmentId: newAssessmentId } = await scenarios.runAssessmentCreationWorkflow(
        sharedTestState.requestContext, 
        expect, 
        sharedTestState.authToken, 
        sharedTestState.userId
      );
      assessmentIdToUse = newAssessmentId;
      sharedTestState.secondAssessmentId = newAssessmentId;
    }
    
    const conversationId = await scenarios.runChatWithAssessmentWorkflow(
      sharedTestState.requestContext,
      expect,
      sharedTestState.authToken,
      assessmentIdToUse
    );
    
    // Store conversation ID for cleanup
    sharedTestState.secondConversationId = conversationId;
  });

  base("7. Delete first chat conversation", async () => {
    await scenarios.deleteAndVerifyConversation(
      sharedTestState.requestContext,
      expect,
      sharedTestState.authToken,
      sharedTestState.firstConversationId
    );
  });

  base("8. Delete second chat conversation", async () => {
    await scenarios.deleteAndVerifyConversation(
      sharedTestState.requestContext,
      expect,
      sharedTestState.authToken,
      sharedTestState.secondConversationId
    );
  });

  base("9. Cleanup assessments", async () => {
    await scenarios.runCleanupWorkflow(
      sharedTestState.requestContext,
      expect,
      sharedTestState.authToken,
      sharedTestState.userId,
      sharedTestState.firstAssessmentId,
      sharedTestState.secondAssessmentId
    );
  });

  base("10. Authentication error handling", async () => {
    await scenarios.runAuthErrorTest(sharedTestState.requestContext, expect);
  });
});
