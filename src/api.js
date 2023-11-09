// src/api.js

import { getUser } from "./auth";

// fragments microservice API, defaults to localhost:8080
//const apiUrl = process.env.API_URL || "http://localhost:8080";
const apiUrl =
  process.env.API_URL || "ec2-52-23-240-151.compute-1.amazonaws.com:8080";

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getUserFragments(user) {
  console.log("Requesting user fragments data...");
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      // Generate headers with the proper Authorization bearer token to pass
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log("Got user fragments data", { data });
  } catch (err) {
    console.error("Unable to call GET /v1/fragment", { err });
  }
}

export async function postUserText(data1, ContentType) {
  const user = await getUser();
  try {
    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: "POST",
      headers: {
        ...user.authorizationHeaders(),
        "Content-Type": ContentType,
      },
      body: data1,
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log("Send user fragments data", { data });
  } catch (err) {
    console.error("Unable to call POST /v1/fragment", { err });
  }
}
