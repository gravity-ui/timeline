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

test("follows exact event bounds through overlaps, zoom, and scrolling", async ({ page }) => {
  await page.goto("/iframe.html?id=integrations-gravity-ui--overlapping-events-popup&viewMode=story");
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas has no bounding box");

  const hover = async (x: number, y: number, id: string) => {
    await page.mouse.move(box.x + x, box.y + y);
    await expect(page.getByText(`ID: ${id}`, { exact: true })).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(1);
    await expect(canvas).toHaveCSS("cursor", "pointer");
  };

  // The higher event must not steal hover within the 5px tolerance of its edge.
  await hover(box.width * 0.3 - 2, 61, "A");
  await hover(box.width * 0.3 + 2, 61, "B");
  await hover(box.width * 0.45 - 2, 61, "B");
  await hover(box.width * 0.45 + 2, 61, "C");
  await hover(box.width * 0.5 - 2, 101, "D");
  await hover(box.width * 0.5 + 2, 101, "E");
  await hover(box.width * 0.5 - 2, 101, "D");

  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  // After zooming to [25, 75], B starts at 10% and C at 40%.
  await hover(box.width * 0.1 - 2, 61, "A");
  await hover(box.width * 0.1 + 2, 61, "B");
  await hover(box.width * 0.4 - 2, 61, "B");
  await hover(box.width * 0.4 + 2, 61, "C");

  await page.getByRole("button", { name: "Scroll down", exact: true }).click();
  await hover(box.width * 0.5 - 2, 81, "D");
  await hover(box.width * 0.5 + 2, 81, "E");
  await page.mouse.move(box.x + box.width * 0.5, box.y + 150);
  await expect(page.getByRole("dialog")).toBeHidden();
});
