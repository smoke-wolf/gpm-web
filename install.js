
function fetchInstallOptions() {
    $.post("http://localhost:5000/install1", function(data) {
      options = data;
      displayOptions(options);
    });
  }

  function displayOptions(options) {
    // Assuming you have an element with the id "optionsList" to display the options
    var optionsList = document.getElementById("optionsList");

    // Clear the existing options
    optionsList.innerHTML = "";

    // Check if the data is an array of files
    if (Array.isArray(options)) {
      options.forEach(function(file) {
        var optionItem = document.createElement("li");
        optionItem.textContent = file;
        optionsList.appendChild(optionItem);
      });
    }
  }

