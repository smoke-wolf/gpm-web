import { Analytics } from '@vercel/analytics/react';

document.getElementById("searchButton").addEventListener("click", function() {
  var searchInput = document.getElementById("searchInput").value;
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      var filteredRepositories = filterRepositories(response.items, searchInput);
      displayResults(filteredRepositories);
    }
  };

  xhr.open("GET", "https://api.github.com/search/repositories?q=" + searchInput, true);
  xhr.send();

  var analytics = document.createElement("div");
  analytics.style.display = "none";
  document.body.appendChild(analytics);

  ReactDOM.render(<Analytics />, analytics);
});

function filterRepositories(repositories, searchInput) {
  var filteredRepositories = repositories.filter(function(repository) {
    var fullName = repository.full_name.toLowerCase();
    var owner = repository.owner.login.toLowerCase();
    return fullName.includes(searchInput.toLowerCase()) || owner.includes(searchInput.toLowerCase());
  });

  filteredRepositories.sort(function(a, b) {
    // Sort by most stars
    var starsA = a.stargazers_count;
    var starsB = b.stargazers_count;
    if (starsA > starsB) {
      return -1;
    } else if (starsA < starsB) {
      return 1;
    } else {
      // If stars are equal, sort by most recent update
      var updatedAtA = new Date(a.updated_at).getTime();
      var updatedAtB = new Date(b.updated_at).getTime();
      return updatedAtB - updatedAtA;
    }
  });

  return filteredRepositories;
}

function displayResults(repositories) {
  var repositoryList = document.getElementById("repositoryList");
  repositoryList.innerHTML = "";

  repositories.forEach(function(repository) {
    var listItem = document.createElement("li");
    listItem.className = "repository";

    var header = document.createElement("div");
    header.className = "repository-header";

    var repoLink = document.createElement("a");
    repoLink.href = repository.html_url;
    repoLink.textContent = repository.full_name;

    var description = document.createElement("p");
    description.textContent = repository.description;
    if (description.textContent.length > 150) {
      description.textContent = description.textContent.substring(0, 150) + "...";
    }

    var arrowIcon = document.createElement("span");
    arrowIcon.className = "arrow-icon";

    var downloadButton = document.createElement("button");
    downloadButton.textContent = "Download & Install";
    downloadButton.classList.add("download-button");
    downloadButton.addEventListener("click", function() {
      runCommandLocally(repository.owner.login, repository.name);
    });

    header.appendChild(repoLink);
    header.appendChild(description);
    header.appendChild(arrowIcon);

    listItem.appendChild(header);
    listItem.appendChild(downloadButton);

    var readmeContent = document.createElement("div");
    readmeContent.className = "readme-content";
    listItem.appendChild(readmeContent);

    listItem.addEventListener("click", function() {
      toggleReadmeContent(readmeContent, repository.owner.login, repository.name);
    });

    repositoryList.appendChild(listItem);
  });
}

document.addEventListener("DOMContentLoaded", function() {
  // Load profile settings
  loadProfileSettings();

  var searchButton = document.getElementById("searchButton");
  searchButton.addEventListener("click", searchRepositories);
});

function loadProfileSettings() {
  // Fetch profile settings from storage or set default values
  var serverSetting = localStorage.getItem("downloadServer") || "http://localhost:3000";
  var serverInput = document.getElementById("serverInput");
  serverInput.value = serverSetting;

  // Save profile settings when input changes
  serverInput.addEventListener("change", function() {
    var newServerSetting = serverInput.value;
    localStorage.setItem("downloadServer", newServerSetting);
  });
}

function runCommandLocally(owner, repo) {
  var serverSetting = localStorage.getItem("downloadServer") || "http://localhost:3000";
  var url = `${serverSetting}/clone/${owner}/${repo}`;
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Command execution failed: ${response.status}`);
      }
      return response.text();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error(`Error: ${error.message}`);
    });
}

function toggleReadmeContent(contentElement, owner, repo) {
  if (contentElement.classList.contains("expanded")) {
    contentElement.innerHTML = "";
    contentElement.classList.remove("expanded");
  } else {
    contentElement.innerHTML = "<em>Loading README...</em>";

    // Fetch the README content
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          contentElement.innerHTML = xhr.responseText;
        } else {
          contentElement.innerHTML = "<em>Failed to load README.</em>";
        }
      }
    };

    xhr.open("GET", `https://api.github.com/repos/${owner}/${repo}/readme`, true);
    xhr.setRequestHeader("Accept", "application/vnd.github.VERSION.html");
    xhr.send();

    contentElement.classList.add("expanded");
  }
}

document.addEventListener("DOMContentLoaded", function() {
  var modal = document.getElementById("readmeModal");
  var closeModal = document.getElementsByClassName("close")[0];

  closeModal.addEventListener("click", function() {
    modal.style.display = "none";
  });

  window.addEventListener("click", function(event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});

document.addEventListener("DOMContentLoaded", function() {
  var profileButton = document.getElementById("profileButton");
  var profilePage = document.getElementById("profilePage");
  var closeButton = profilePage.querySelector(".close");
  var serverStatus = document.getElementById("serverStatus");

  profileButton.addEventListener("click", function() {
    profilePage.style.display = "block";
    loadProfileData();
  });

  closeButton.addEventListener("click", function() {
    profilePage.style.display = "none";
  });

  function loadProfileData() {
    // Get user IP
    fetch("https://api.ipify.org/?format=json")
      .then(response => response.json())
      .then(data => {
        var userIP = document.getElementById("userIP");
        userIP.textContent = "User IP: " + data.ip;
      })
      .catch(error => {
        console.error("Error getting user IP:", error);
      });

    // Get download count (replace with your own logic to fetch download count)
    var downloadCount = document.getElementById("downloadCount");
    downloadCount.textContent = "Download Count: 0"; // Replace 0 with actual download count

    // Check server status
    checkServerStatus(serverStatus);
  }

  function checkServerStatus() {
  var serverUrl = "http://localhost:3000/status"; // Replace with your server URL

  fetch(serverUrl)
    .then(response => {
      if (response.status === 200) {
        return response.json(); // Parse the response as JSON
      } else {
        throw new Error("Server response was not OK");
      }
    })
    .then(data => {
      serverStatus.textContent = "Server Status: Online";
    })
    .catch(error => {
      serverStatus.textContent = "Server Status: Offline";
    });
}


  // Initial load of profile data
  loadProfileData();
});


$(document).ready(function() {
  // Profile Button Click Event
  $('#profileButton').click(function() {
    $('#profilePage').toggleClass('active');
    $('#container').toggleClass('background-fade');
  });

  // Close Button Click Event
  $('.close').click(function() {
    $('#profilePage').removeClass('active');
    $('#container').removeClass('background-fade');
  });
});


// Update profile values
document.addEventListener("DOMContentLoaded", function() {
  // Get user IP (replace with your logic to retrieve the user IP)
  var userIP = "123.456.789.0"; // Replace with the actual user IP value
  var userIPElement = document.getElementById("userIP");
  userIPElement.textContent = "User IP: " + userIP;

  // Get download count (replace with your logic to fetch the download count)
  var downloadCount = 100; // Replace with the actual download count value
  var downloadCountElement = document.getElementById("downloadCount");
  downloadCountElement.textContent = "Download Count: " + downloadCount;

  // Check server status
  checkServerStatus()
    .then((status) => {
      var serverStatus = status ? "Online" : "Offline";
      var serverStatusElement = document.getElementById("serverStatus");
      serverStatusElement.textContent = "Server Status: " + serverStatus;
    });
});
