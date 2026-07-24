import { describe, expect, it } from "vitest";
import { GET } from "../app/api/health/route";

describe("GET /api/health", () => {
  it("debe responder con código HTTP 200", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
  });

  it("debe indicar que la aplicación está funcionando", async () => {
    const response = await GET();
    const body = await response.json();

    expect(body.status).toBe("ok");
    expect(body.application).toBe("InmoGestion AI");
  });

  it("debe devolver una fecha válida en formato ISO", async () => {
    const response = await GET();
    const body = await response.json();

    expect(body.timestamp).toBeDefined();
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });
});
