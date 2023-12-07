// src/app.js

import { Auth, getUser } from "./auth";
import {
  getUserFragments,
  postUserFragment,
  deleteUserFragment,
  updateUserFragmentData,
  getFragmentData,
} from "./api";

async function init() {
  // Get our UI elements
  const loginBtn = document.querySelector("#login");
  const logoutBtn = document.querySelector("#logout");

  const userSection = document.querySelector("#user");

  const fragmentSection = document.getElementById("fragment-section");
  const fragmentsTypes = document.getElementById("fragments-types");
  const imgUploaderSection = document.getElementById("img-section-uploader");
  const fragmentImageData = document.getElementById("fragment-img-data");
  const txtUploaderSection = document.getElementById("txt-section-uploader");
  const fragmentTextData = document.getElementById("fragment-txt-data");
  const addFragmentBtn = document.getElementById("add-fragment");
  const fragmentEditSection = document.getElementById("fragment-edit-section");
  const fragmentViewSection = document.getElementById("fragment-view-section");
  const txtEditUploaderSection = document.getElementById(
    "txt-section-edit-uploader"
  );
  const imgEditUploaderSection = document.getElementById(
    "img-section-edit-uploader"
  );
  const fragmentImageEditData = document.getElementById(
    "fragment-img-edit-data"
  );
  const fragmentTextEditData = document.getElementById(
    "fragment-txt-edit-data"
  );
  const updateFragmentBtn = document.getElementById("update-fragment");
  const tableBody = document.getElementById("tableBody");
  const findFragmentData = document.getElementById("find-fragment-data");
  const findFragmentDataId = document.getElementById("find-data-id");
  const findFragmentDataExt = document.getElementById("find-data-ext");
  const dataRequestSection = document.getElementById("data-request-section");
  const imgDisplay = document.getElementById("image-display");
  const noImgDisplay = document.getElementById("noImage-display");
  const editIds = document.querySelectorAll(".editId");

  // image input for upload
  var inputImageUpload;

  // for edit request
  var selectedFragmentId;
  var selectedFragmentType;
  var inputImageEdit;

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
    fragmentEditSection.hidden = true;
    imgDisplay.hidden = true;
    noImgDisplay.hidden = true;
    dataRequestSection.hidden = true;
    return;
  }

  // Log the user info for debugging purposes
  console.log({ user });

  // display image or text input felid according fragment type selection
  fragmentsTypes.onchange = () => {
    if (
      ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(
        fragmentsTypes.value
      )
    ) {
      imgUploaderSection.hidden = false;
      txtUploaderSection.hidden = true;
    } else {
      imgUploaderSection.hidden = true;
      txtUploaderSection.hidden = false;
    }
  };

  fragmentImageData.onchange = () => {
    inputImageUpload = fragmentImageData.files[0];
  };

  fragmentImageEditData.onchange = () => {
    inputImageEdit = fragmentImageEditData.files[0];
  };

  addFragmentBtn.onclick = async () => {
    let postData = fragmentTextData.value || inputImageUpload;
    await postUserFragment(user, fragmentsTypes.value, postData);
    location.reload();
  };

  findFragmentData.onclick = async () => {
    let ext = findFragmentDataExt.value || "";
    let { contentType, data } = await getFragmentData(
      user,
      findFragmentDataId.value,
      ext
    );

    noImgDisplay.innerHTML = "";
    imgDisplay.hidden = true;

    if (contentType.startsWith("image/")) {
      imgDisplay.src = URL.createObjectURL(data);
      imgDisplay.hidden = false;
    } else {
      data = contentType.startsWith("application/json")
        ? JSON.stringify(data)
        : data;
      let txt = document.createTextNode(data);
      noImgDisplay.appendChild(txt);
      noImgDisplay.hidden = false;
    }
  };

  updateFragmentBtn.onclick = async () => {
    let editData = fragmentTextEditData.value || inputImageEdit;
    await updateUserFragmentData(
      user,
      selectedFragmentId,
      selectedFragmentType,
      editData
    );
    location.reload();
  };

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector(".username").innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;

  // Do an authenticated request to the fragments API server and log the result
  const fragments = await getUserFragments(user, 1);

  if (fragments.length > 0) {
    fragmentViewSection.hidden = false;

    fragments.forEach((fragment) => {
      const tr = document.createElement("tr");

      let deleteBtn = document.createElement("button");
      let deleteBtnTxt = document.createTextNode("Delete");
      let editBtn = document.createElement("button");
      let editBtnTxt = document.createTextNode("Edit");
      let buttonsCell = document.createElement("td");

      buttonsCell.classList.add("buttonsCell");
      deleteBtn.style.backgroundColor = "red";

      deleteBtn.onclick = async () => {
        await deleteUserFragment(user, fragment["id"]);
        location.reload();
      };

      editBtn.onclick = async () => {
        selectedFragmentId = fragment.id;
        selectedFragmentType = fragment.type;

        editIds.forEach((editId) => (editId.innerHTML = ""));

        editIds.forEach((editId) =>
          editId.appendChild(document.createTextNode(selectedFragmentId))
        );

        fragmentEditSection.hidden = false;

        if (fragment.type.split("/")[0] == "image") {
          imgEditUploaderSection.hidden = false;
          txtEditUploaderSection.hidden = true;
        } else {
          imgEditUploaderSection.hidden = true;
          txtEditUploaderSection.hidden = false;
        }
      };

      deleteBtn.appendChild(deleteBtnTxt);
      editBtn.appendChild(editBtnTxt);
      buttonsCell.appendChild(deleteBtn);
      buttonsCell.appendChild(editBtn);
      tr.appendChild(buttonsCell);

      ["ownerId", "id", "type", "created", "updated", "size"].forEach(
        (element) => {
          const text = document.createTextNode(fragment[element]);
          const td = document.createElement("td");

          td.classList.add(element);

          td.appendChild(text);
          tr.appendChild(td);
        }
      );
      tableBody.appendChild(tr);
    });
  } else {
    fragmentViewSection.hidden = true;
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
