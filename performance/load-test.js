import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "5s", target: 50 },
    { duration: "20s", target: 50 },
    { duration: "5s", target: 0 },
  ],

  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
    checks: ["rate>0.99"],
  },
};

export default function () {
  const response = http.get(
    "https://inmogestion-uri117.duckdns.org/api/health"
  );

  check(response, {
    "responde con HTTP 200": (r) => r.status === 200,
    "devuelve el estado ok": (r) => {
      try {
        return r.json("status") === "ok";
      } catch {
        return false;
      }
    },
    "usa HTTPS": (r) => r.url.startsWith("https://"),
  });

  sleep(1);
}
