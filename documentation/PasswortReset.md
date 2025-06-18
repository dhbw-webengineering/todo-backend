# Passwort zurücksetzen - Ablauf im Backend

## 1. Anfrage zum Zurücksetzen des Passworts
- Der Nutzer sendet seine E-Mail an die Route `/password-reset/request`.
- Das Backend prüft, ob ein Benutzer mit der angegebenen E-Mail existiert.
- Falls ja, wird ein einmaliger, zeitlich begrenzter Token erzeugt und in der Datenbank gespeichert.
- Ein Link mit dem Token wird per E-Mail an den Nutzer gesendet.

## 2. Token-Überprüfung
- Der Nutzer klickt auf den Link und ruft die Route `/password-reset/verify` mit dem Token auf.
- Das Backend prüft, ob der Token gültig und nicht abgelaufen ist.
- Falls der Token gültig ist, erhält der Nutzer eine Bestätigung (z.B. für die UI).

## 3. Neues Passwort setzen
- Der Nutzer sendet das neue Passwort zusammen mit dem Token an die Route `/password-reset/reset`.
- Das Backend validiert den Token erneut.
- Das Passwort wird gehasht und in der Datenbank des Nutzers aktualisiert.
- Der Token wird als verwendet markiert oder gelöscht, um Mehrfachverwendung zu verhindern.
- Eine Erfolgsmeldung wird zurückgegeben.

---

## Wichtige Komponenten

- **TokenService:** Erzeugt, validiert und konsumiert Tokens.
- **EmailService:** Versendet den Reset-Link per E-Mail.
- **Routes:** `/password-reset/request`, `/password-reset/verify`, `/password-reset/reset`.
- **Datenbank:** Speichert Tokens mit Ablaufzeit und Verknüpfung zum Benutzer.

---

## Sicherheitshinweise

- Tokens sollten zeitlich begrenzt (z.B. 30 Minuten) gültig sein.
- Token dürfen nur einmal verwendet werden.
- Passwörter werden mit bcrypt o.ä. sicher gehasht.
- Bei falscher oder fehlender E-Mail wird aus Sicherheitsgründen keine Information zur Existenz des Nutzers preisgegeben.
