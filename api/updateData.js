const fs = require("fs");

function updateData(req, res) {
  const { type, data } = req.body;

  if (type === "viewedRepos") {
    fs.writeFile("./data/viewedRepos.json", JSON.stringify(data), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating viewed repositories" });
      } else {
        res.status(200).json({ message: "Viewed repositories updated successfully" });
      }
    });
  } else if (type === "searches") {
    fs.writeFile("./data/searches.json", JSON.stringify(data), (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating searches" });
      } else {
        res.status(200).json({ message: "Searches updated successfully" });
      }
    });
  } else {
    res.status(400).json({ message: "Invalid data type" });
  }
}

module.exports = updateData;
