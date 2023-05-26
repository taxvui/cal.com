import { expect } from "@playwright/test";

import dayjs from "@calcom/dayjs";
import prisma from "@calcom/prisma";
import { WorkflowMethods } from "@calcom/prisma/enums";

import { test } from "./lib/fixtures";
import { selectFirstAvailableTimeSlotNextMonth } from "./lib/testUtils";

test.afterEach(({ users }) => users.deleteAll());

test.describe("Workflow tests", () => {
  test.describe("User Workflows", () => {
    test("Create default reminder workflow & trigger when event type is booked", async ({ page, users }) => {
      const user = await users.create();
      const [eventType] = user.eventTypes;
      await user.login();
      await page.goto(`/workflows`);

      await page.click('[data-testid="create-button"]');

      // select first event type
      await page.getByText("Select...").click();
      await page.getByText(eventType.title, { exact: true }).click();

      // name workflow
      await page.fill('[data-testid="workflow-name"]', "Test workflow");

      // save workflow
      await page.click('[data-testid="save-workflow"]');

      // check if workflow is saved
      await expect(page.locator('[data-testid="workflow-list"] > li')).toHaveCount(1);

      // book event type
      await page.goto(`/${user.username}/${eventType.slug}`);
      await selectFirstAvailableTimeSlotNextMonth(page);

      await page.fill('[name="name"]', "Test");
      await page.fill('[name="email"]', "test@example.com");
      await page.press('[name="email"]', "Enter");

      // Make sure booking is completed
      await expect(page.locator("[data-testid=success-page]")).toBeVisible();

      const booking = await prisma.booking.findFirst({
        where: {
          eventTypeId: eventType.id,
        },
      });

      // check if workflow triggered
      const workflowReminders = await prisma.workflowReminder.findMany({
        where: {
          bookingUid: booking?.uid ?? "",
        },
      });

      expect(workflowReminders).toHaveLength(1);

      const scheduledDate = dayjs(booking?.startTime).subtract(1, "day").toDate();

      expect(workflowReminders[0].method).toBe(WorkflowMethods.EMAIL);
      expect(workflowReminders[0].scheduledDate.toISOString()).toBe(scheduledDate.toISOString());
    });

    //todo: test cancelling of booking and deleting workflow reminder
    //todo: test the other triggers
  });

  /*
  test.describe("Team Workflows", () => {
    test("Admin can create and update team workflow", async ({ page, users }) => {
      // managed-event-types.e2e.ts has as flow for creating a team (not sure if there is anything better)
    });
    test("Members can not create and update team workflows", async ({ page, users }) => {});
  });
  */
});
