import sys
import requests
from PyQt5.QtWidgets import QApplication, QWidget, QVBoxLayout, QLabel, QLineEdit, QPushButton, QTextEdit

class SongRecommendationApp(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Song Recommendation App")
        self.layout = QVBoxLayout()

        self.artist_label = QLabel("Artist:")
        self.artist_input = QLineEdit()
        self.layout.addWidget(self.artist_label)
        self.layout.addWidget(self.artist_input)

        self.track_label = QLabel("Song:")
        self.track_input = QLineEdit()
        self.layout.addWidget(self.track_label)
        self.layout.addWidget(self.track_input)

        self.recommend_button = QPushButton("Recommend")
        self.recommend_button.clicked.connect(self.recommend_song)
        self.layout.addWidget(self.recommend_button)

        self.recommendation_text = QTextEdit()
        self.recommendation_text.setReadOnly(True)
        self.layout.addWidget(self.recommendation_text)

        self.setLayout(self.layout)

    def get_similar_tracks(self, artist, track):
        # Last.fm API endpoint for track.getSimilar
        url = "http://ws.audioscrobbler.com/2.0/"
        params = {
            "method": "track.getSimilar",
            "artist": artist,
            "track": track,
            "limit": 5,  # Number of similar tracks to retrieve
            "api_key": "df16fdf3baec16ad326ca18d02f44fc1",
            "format": "json"
        }

        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            similar_tracks = data["similartracks"]["track"]
            return similar_tracks
        except requests.exceptions.RequestException as e:
            print("Error occurred:", e)
            return None

    def recommend_song(self):
        artist = self.artist_input.text()
        track = self.track_input.text()

        if artist and track:
            similar_tracks = self.get_similar_tracks(artist, track)
            if similar_tracks:
                recommendations = ""
                for idx, song in enumerate(similar_tracks, start=1):
                    track_name = song["name"]
                    artist_name = song["artist"]["name"]
                    recommendations += f"{idx}. '{track_name}' by {artist_name}\n"
                self.recommendation_text.setText(recommendations)
            else:
                self.recommendation_text.setText("No recommendations found.")
        else:
            self.recommendation_text.setText("Please enter an artist and a song.")

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = SongRecommendationApp()
    window.show()
    sys.exit(app.exec_())
