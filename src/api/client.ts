const API_URL =
  "https://script.google.com/macros/s/AKfycbzrvI9lS7QKZPPO8dWiL6IXnNgJydVv-C-KLAhzuuJMLJ1Q2Br-XthB1Y12wx78gGACfw/exec";

export type ApiParams = Record<string, string | number | boolean | undefined>;

export async function apiRequest(
  params: ApiParams,
  method: "GET" | "POST" = "GET"
): Promise<unknown> {
  const url = new URL(API_URL);

  if (method === "GET") {
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined) url.searchParams.append(key, String(params[key]));
    });
    const response = await fetch(url.toString(), {
      method: "GET",
      mode: "cors",
      redirect: "follow",
    });
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  } else {
    const formData = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined) formData.append(key, String(params[key]));
    });
    const response = await fetch(API_URL, {
      method: "POST",
      mode: "cors",
      redirect: "follow",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  }
}
