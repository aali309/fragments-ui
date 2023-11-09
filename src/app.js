// src/app.js

import { Auth, getUser } from "./auth";
import { getUserFragments, postUserText } from "./api";

async function init() {
  // Get our UI elements
  const userSection = document.querySelector("#user");
  const loginBtn = document.querySelector("#login");
  const logoutBtn = document.querySelector("#logout");
  const addFragmentBtn = document.getElementById("add-fragment");
  const fragmentSection = document.getElementById("fragment-section");

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    fragmentSection.hidden = true;
    fragmentViewSection.hidden = true;
    return;
  }

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector(".username").innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;

  // Do an authenticated request to the fragments API server and log the result
  getUserFragments(user);
  getInputValue();
}

async function getInputValue() {
  // Selecting the input element and get its value
  const submitbtn = document.querySelector("#sbbtn");
  var contentType = document.getElementById("formats");
  submitbtn.onclick = () => {
    //console.log(contentType.options[contentType.selectedIndex].text)
    postUserText(
      document.getElementById("myInput").value,
      contentType.options[contentType.selectedIndex].text
    );
  };
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
