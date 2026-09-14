import { expect, test } from "@playwright/test";

test("shows interactive details for a hovered event", async ({ page }) => {
  await page.goto("/iframe.html?id=integrations-gravity-ui--popup&viewMode=story");
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();

  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas has no bounding box");
  const eventPoint = { x: box.x + box.width * 0.3, y: box.y + 71 };
  const emptyPoint = { x: box.x + box.width * 0.9, y: box.y + 71 };

  await page.mouse.move(eventPoint.x, eventPoint.y);

  await expect(page.getByText("ID: test2")).toBeVisible();

  await page.mouse.move(emptyPoint.x, emptyPoint.y);
  await expect(page.getByText("ID: test2")).toBeHidden();

  await page.mouse.move(eventPoint.x, eventPoint.y);
  await expect(page.getByText("ID: test2")).toBeVisible();

  await page.mouse.click(eventPoint.x, eventPoint.y);
  await expect(page.getByText("ID: test2")).toBeHidden();

  await page.mouse.move(emptyPoint.x, emptyPoint.y);
  await expect(page.getByText("ID: test2")).toBeHidden();

  await page.mouse.move(eventPoint.x, eventPoint.y);
  await expect(page.getByText("ID: test2")).toBeVisible();
  await page.getByRole("button", { name: "Action" }).click();
});
