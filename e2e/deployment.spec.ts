import { expect, test } from "@playwright/test";

test.describe("Despliegue de InmoGestion AI", () => {
  test("la página principal carga mediante HTTPS", async ({ page }) => {
    const response = await page.goto("/");

    expect(response).not.toBeNull();
    expect(response?.status()).toBe(200);

    await expect(page).toHaveURL(
      /^https:\/\/inmogestion-uri117\.duckdns\.org/
    );

    await expect(page.locator("body")).toContainText("InmoGestion AI", { ignoreCase: true });
    await expect(page.locator("body")).toContainText(
      "Gestiona rentas con"
    );
    await expect(page.locator("body")).toContainText(
      "Inteligencia Real"
    );
  });

  test("el endpoint de salud responde correctamente", async ({
    request,
  }) => {
    const response = await request.get("/api/health");

    expect(response.status()).toBe(200);
    expect(response.ok()).toBe(true);

    const body = await response.json();

    expect(body.status).toBe("ok");
    expect(body.application).toBe("InmoGestion AI");
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });

  test("el servidor entrega encabezados de seguridad", async ({
    request,
  }) => {
    const response = await request.get("/");

    expect(response.status()).toBe(200);

    const headers = response.headers();

    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["content-security-policy"]).toBeTruthy();
  });
});

