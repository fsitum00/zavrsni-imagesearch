import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { b64decode } from "k6/encoding";

const errorRate = new Rate("errors");
const responseTime = new Trend("response_time");

export const options = {
  stages: [
    { duration: "1m", target: 50 }, // Ramp up to 50 users
    { duration: "1m", target: 50 }, // Stay at 50 users
    { duration: "1m", target: 100 }, // Ramp up to 100 users
    { duration: "1m", target: 100 }, // Stay at 100 users
    { duration: "1m", target: 200 }, // Ramp up to 200 users
    { duration: "1m", target: 200 }, // Stay at 200 users
    { duration: "1m", target: 0 }, // Ramp down to 0 users
  ],
};

const stressQueries = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "jeans",
  "sunglasses",
  "shorts",
  "t-shirt",
  "dress",
  "jacket",
  "belt",
  "shoes",
  "hat",
  "scarf",
  "gloves",
  "socks",
  "underwear",
  "swimwear",
  "coat",
];

function getRandomQuery() {
  return stressQueries[Math.floor(Math.random() * stressQueries.length)];
}

function createTestImage() {
  const base64Image =
    "data:image/jpeg;base64,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";

  const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");

  return b64decode(base64Data);
}

export default function () {
  const baseUrl = __ENV.BASE_URL || "http://localhost:3000";

  const testType = Math.random();

  if (testType < 0.7) {
    const query = getRandomQuery();
    const payload = JSON.stringify({
      query: query,
      limit: Math.floor(Math.random() * 20) + 1,
    });

    const params = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const startTime = Date.now();
    const response = http.post(`${baseUrl}/search/text`, payload, params);
    const duration = Date.now() - startTime;

    responseTime.add(duration);

    const success = check(response, {
      "text search status is 200": (r) => r.status === 200,
      "text search response time < 5000ms": (r) => r.timings.duration < 5000,
    });

    if (!success) {
      errorRate.add(1);
    }
  } else {
    const testImage = createTestImage();

    const formData = {
      image: http.file(testImage, "stress-test.jpg", "image/jpeg"),
      limit: Math.floor(Math.random() * 10) + 1,
    };

    const startTime = Date.now();
    const response = http.post(`${baseUrl}/search/image`, formData);
    const duration = Date.now() - startTime;

    responseTime.add(duration);

    const success = check(response, {
      "image search status is 200": (r) => r.status === 200,
      "image search response time < 8000ms": (r) => r.timings.duration < 8000,
    });

    if (!success) {
      errorRate.add(1);
    }
  }

  sleep(Math.random() * 0.5 + 0.1);
}

export function setup() {
  console.log("Starting k6 stress tests...");
  console.log(`Base URL: ${__ENV.BASE_URL || "http://localhost:3000"}`);
  console.log(
    "This test will gradually increase load to stress test the system."
  );

  return { baseUrl: __ENV.BASE_URL || "http://localhost:3000" };
}

export function teardown(data) {
  console.log("Stress tests completed.");
}
export function handleSummary(data) {
  return {
    "summary.html": htmlReport(data),
  };
}
