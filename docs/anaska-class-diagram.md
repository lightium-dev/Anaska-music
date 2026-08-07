# Anaska — Class Diagram
 
Layered pyramid: State layer (top) -> Service layer (middle) -> Data layer (base).
 
```mermaid
classDiagram
  %% ===== State layer =====
  class PlayerStore {
    +Track currentTrack
    +boolean isPlaying
    +number progress
    +play(track)
    +pause()
    +seek(time)
  }
 
  %% ===== Service layer =====
  class AuthService {
    +signup(data)
    +login(credentials)
    +refreshToken(token)
    +hashPassword(pw)
  }
  class MusicService {
    +getTracks(filter)
    +getGenres()
    +streamTrack(id)
  }
  class AIAssistantService {
    +streamResponse(sessionId, msg)
    +getContext(query)
  }
 
  %% ===== Data layer =====
  class User {
    +string id
    +string username
    +string email
    +string passwordHash
    +string[] genrePreferences
    +Date createdAt
  }
  class Genre {
    +string id
    +string name
  }
  class Track {
    +string id
    +string title
    +string artist
    +string genreId
    +string audioUrl
    +string coverUrl
    +number duration
  }
  class ChatSession {
    +string id
    +string userId
    +Date startedAt
  }
  class ChatMessage {
    +string id
    +string sessionId
    +string role
    +string content
    +Date createdAt
  }
 
  %% ===== Relationships =====
  PlayerStore ..> MusicService : reads tracks via
  AuthService ..> User : manages
  MusicService ..> Genre : serves
  MusicService ..> Track : serves
  AIAssistantService ..> ChatSession : uses
  AIAssistantService ..> ChatMessage : generates
 
  User "*" --> "*" Genre : prefers
  Genre "1" --> "*" Track : categorizes
  User "1" --> "*" ChatSession : starts
  ChatSession "1" --> "*" ChatMessage : contains
```
 
## How to view this in VS Code
 
1. Install the **Markdown Preview Mermaid Support** extension (or **Mermaid Markdown Syntax Highlighting**).
2. Open this file and press `Ctrl+Shift+V` (or `Cmd+Shift+V` on Mac) to open the Markdown preview — the diagram renders inline.
3. Alternatively, paste just the code inside the triple-backtick block into [mermaid.live](https://mermaid.live) to view or export it as PNG/SVG.
 