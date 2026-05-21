const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = async (
  endpoint,
  options = {}
) => {

  const token =
    localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      cache: "no-store",
      ...options,
      headers,
    }
  );

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  } else {
    const text = await response.text();
    return { status: response.status, message: text || "Non-JSON response" };
  }
};