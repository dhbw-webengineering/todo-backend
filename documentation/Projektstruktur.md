# Projektstruktur und Verantwortlichkeiten
### 1. `src/app.ts`  
- Einstiegspunkt der Anwendung  
- Initialisiert Fastify, registriert Plugins, bindet die Routen ein und startet den Server  

### 2. `src/plugins/`  
- Beinhaltet Fastify-Plugins, die einmalig registriert werden  
- Beispiel: `jwt.ts` für die Konfiguration und Registrierung des JWT-Plugins sowie Middleware wie Authentifizierung  

### 3. `src/routes/`  
- Definieren die HTTP-Endpunkte (z.B. `/login`, `/register`, `/todos`)  
- Verantwortlich für Routing und Middleware-Verknüpfung  
- Rufen Controller-Funktionen auf, die die eigentliche Geschäftslogik enthalten  

### 4. `src/controllers/`  
- Enthält die Business-Logik der jeweiligen Funktionen  
- Controller arbeiten mit Services zusammen und verarbeiten die Anfragen entsprechend  
- Beispiel: `authController.ts` verarbeitet Login-Daten, validiert sie, nutzt den UserService und gibt die Antwort zurück  

### 5. `src/services/`  
- Service-Schicht für datenbezogene Logik und externe Integrationen  
- Kommunikation mit der Datenbank erfolgt über Prisma (z.B. `prisma/client.ts`)  
- Beispiel: `userService.ts` bietet Funktionen wie `createUser()` oder `findUserByEmail()`  
- `emailService.ts` übernimmt Aufgaben wie den Versand von E-Mails, etwa für Passwort-Reset-Links  

### 6. `src/prisma/`  
- Prisma-spezifische Dateien und Code  
- `client.ts` initialisiert den PrismaClient als Singleton, um Mehrfach-Instanzen zu vermeiden  
- Die Datei `schema.prisma` definiert das Datenbankschema sowie Einstellungen für die Datenbank (Provider, Modelle, Relationen)  

### 7. `src/types/`  
- Eigene TypeScript-Deklarationen zur Erweiterung von Fastify-Instanzen oder Request-Objekten  
- Beispielsweise wird hier der Typ von `request.user` nach erfolgreicher Authentifizierung definiert  


# Tree
src/  
├── app.ts # Einstiegspunkt: Fastify-Server initialisieren und starten  
├── plugins/  
│ └── jwt.ts # Fastify-Plugin für JWT-Authentifizierung (Registrierung + Middleware)  
├── routes/  
│ ├── auth.ts # HTTP-Routen für Registrierung und Login  
│ ├── passwordReset.ts # HTTP-Routen für Passwort-Reset-Anfrage und -Ausführung  
│ └── todos.ts # Geschützte Todo-Routen (CRUD)  
├── controllers/  
│ ├── authController.ts # Business-Logik für Authentifizierung (Registrierung, Login)  
│ ├── passwordController.ts# Business-Logik für Passwort-Reset  
│ └── todoController.ts # Business-Logik für Todo-Operationen  
├── services/  
│ ├── userService.ts # Datenbankzugriffe und Logik rund um User (z.B. User finden, erstellen)  
│ ├── tokenService.ts # Reset-Token erstellen, prüfen, löschen  
│ └── emailService.ts # (Optional) Versenden von Emails (z.B. Reset-Link)  
├── prisma/  
│ ├── client.ts # PrismaClient als Singleton (Zugriff auf DB)  
│ └── schema.prisma # Prisma Datenmodell & Datenbankkonfiguration  
└── types/  
└── fastify.d.ts # TypeScript-Erweiterungen für Fastify (z.B. request.user)  
