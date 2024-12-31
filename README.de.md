# Spectre

[![en](https://img.shields.io/badge/lang-en-red.svg)](README.md)

![Header Graphic](/assets/readme-header.png)

Ein Gespenst geht um in Europa. Dies ist sein Theme. 👻 [Ghost](https://github.com/TryGhost/Ghost)-Theme für Politiker\_innen und Gliederungen der Partei Die Linke.

# Demo

- [spectre.hutt.io](spectre.hutt.io)
- [Ines Schwerdtner](https://inesschwerdtner.de)
- [BAG Betrieb und Gewerkschaft](https://betriebundgewerkschaft.de)

# Mockup & Screenshots

![Theme Mockup](/assets/mockup-inesschwerdtner.de.png)

|[Live Demo](https://spectre.hutt.io/)|[Download](https://github.com/hutt/spectre/releases/)|
|---|---|

# Erstmalige Verwendung eines Ghost-Themes?

Ghost verwendet eine einfache Vorlagensprache namens [Handlebars](http://handlebarsjs.com/) für seine Themes.

**Die Hauptdateien sind:**

- `default.hbs` - Die übergeordnete Vorlagendatei, die den globalen Header/Footer enthält
- `home.hbs` - Die Startseite
- `index.hbs` - Die Hauptvorlage zur Generierung einer Beitragsliste
- `post.hbs` - Die Vorlage zur Darstellung einzelner Beiträge
- `page.hbs` - Verwendet für einzelne Seiten
- `tag.hbs` - Verwendet für Tag-Archive, z.B. "alle Beiträge mit dem Tag \`news\`"
- `author.hbs` - Verwendet für Autoren-Archive, z.B. "alle Beiträge von Jamie"

Man kann auch benutzerdefinierte Vorlagen erstellen, indem man den Slug einer Seite zum Namen der Vorlagendatei hinzufügt. Zum Beispiel:

- `page-about.hbs` - Benutzerdefinierte Vorlage für eine `/about/`-Seite
- `tag-news.hbs` - Benutzerdefinierte Vorlage für das `/tag/news/`-Archiv
- `author-ines.hbs` - Benutzerdefinierte Vorlage für das `/author/ines/`-Archiv

# Routes

Das Theme ermöglicht eine statische Startseite sowie einen Blog mit entsprechender Index-Seite. Zum Setzen einer statischen Startseite unter dem Pfad `/` muss jedoch die [routes.yaml-Datei](routes.yaml) angepasst werden. 

Zum Beispiel so (Der Slug der Startseite ist in diesem Beispiel `start`, deshalb `data: page.start`):

```yaml
routes:
  /: 
    template: page
    data: page.start
  /sitemap/:
    template: sitemap
    content_type: text/html

collections:
  /presse/mitteilungen/:
    permalink: /presse/mitteilungen/{year}/{slug}/
    template: search-pressemitteilungen
    filter: 'tag:hash-pressemitteilung'
  /termine/archiv/:
    permalink: /termine/{year}/{slug}/
    template: search-termine
    filter: 'tag:hash-termin'
  /blog/:
    permalink: /blog/{slug}/
    template: home

taxonomies:
  tag: /tag/{slug}/
  author: /autor_in/{slug}/

```

Vorsicht: **Collections müssen in der richtigen Reihenfolge angegeben werden.** Inhalte, die der vorherigen genannten Collection mit einem Filter bereits zugewiesen wurden (z.B. alle mit dem Tag `#termin` bzw. `hash-termin`, wie man es in der routes-Datei schreiben würde), können nicht Teil der nachfolgenden Collections (z.B. `/blog/`) sein. Deshalb muss für `/blog/` kein Filter mehr angegeben werden, der Pressemitteilungen und Termine exkludiert.

Beispiel: Würde die Collection `/blog/` im obigen Beispiel über der Collection `/termine/archiv/` (mit dem Filter `#termin` bzw. `hash-termin`) definiert, wäre die Termine-Collection komplett leer, weil die mit dem Filter angegebenen Posts schon einer anderen zugeordnet wurden.

Mehr Informationen zu Collections finden sich [in der offiziellen Dokumentation](https://ghost.org/tutorials/content-collections/).

# Termine und Pressemitteilungen

Wie man im Beispielcode für `routes.yaml` sehen kann, unterstützt dieses Theme auch benutzerdefinierte Seiten für Termine und Pressemitteilungen. So erscheinen diese Arten von Posts nicht im Blog-Index neben allen anderen Artikeln.

## Termine

### Termine-Collection zur routes.yaml-Datei hinzufügen

Folgende Zeilen zum collection-Objekt in `routes.yaml` hinzufügen:

```yaml
collections:
  /termine/archiv/:
    permalink: /termine/{year}/{slug}/
    template: search-termine
    filter: 'tag:hash-termin'
```

### Erstellen einer Termin-Seite

Einfach eine Seite mit dem Editor erstellen, benennen (z.B. "Termine" mit dem entsprechenden Slug `termine`) und mit zusätzlichen Informationen füllen. Dann in der Seitenoptionen-Seitenleiste die Seitenvorlage `Termine` auswählen. Von nun an zeigt die Seite die fünf neuesten Termine unter dem eigentlichen Seiten-Inhalt an.

### Erstellen eines neuen Termins

Um einen Termin hinzuzufügen, kann man einfach einen neuen Post erstellen und die Termininformationen einfügen. Es empfiehlt sich, das Veranstaltungsdatum in den Titel zu setzen (z.B. `31.12.2024: Silvesterfeier`). Dann den Post mit dem internen Tag `#termin` versehen. Dies stellt sicher, dass der Termin nicht im Haupt-Blog-Index angezeigt wird, sondern nur auf der Termine-Seite (sowie im Termine-Archiv; in diesem Fall also unter `/termine/archiv`).

## Pressemitteilungen

### Pressemitteilungs-Collection zur routes.yaml-Datei hinzufügen

Folgende Zeilen zum collection-Objekt in `routes.yaml` hinzufügen:

```yaml
collections:
  /presse/mitteilungen/:
    permalink: /presse/mitteilungen/{year}/{slug}/
    template: search-pressemitteilungen
    filter: 'tag:hash-pressemitteilung'
```

### Erstellen einer Pressemitteilungs-Seite

Einfach eine Seite mit dem Editor erstellen, benennen (z.B. "Presse" mit dem entsprechenden Slug `presse`) und mit Inhalten wie einem Pressekontakt oder Pressephotos füllen. Dann in der Seitenoptionen-Seitenleiste die Seitenvorlage `Presse` auswählen. Von nun an zeigt die Seite die fünf neuesten Pressemitteilungen unter dem eigentlichen Seiten-Inhalt an.

### Erstellen einer neuen Pressemitteilung

Um eine Pressemitteilung hinzuzufügen, einfach einen neuen Post mit der Pressemitteilung erstellen. Dann den Post mit dem internen Tag `#pressemitteilung` versehen. Dies stellt sicher, dass die Pressemitteilung nicht im Haupt-Blog-Index angezeigt wird, sondern nur auf der Pressemitteilungen-Seite (sowie im Pressemitteilungen-Archiv; in diesem Fall also unter `/presse/mitteilungen`).

# Datenschutzfreundliche YouTube-Video-Einbettungen

Dieses Theme ermöglicht datenschutzfreundliche und damit DSGVO-konforme YouTube-Video-Einbettungen mit [light-yt.js](https://www.labnol.org/internet/light-youtube-embeds/27941/) von [Amit Agarwal](https://github.com/labnol).

## YouTube-Video datenschutzfreundlich einbetten

1. YouTube-Video-ID kopieren (wenn die Video-URL `https://www.youtube.com/watch?v=dQw4w9WgXcQ` ist, lautet die ID `dQw4w9WgXcQ`)
2. Im Editor einen HTML-Block an der Stelle einfügen, wo das Video platziert werden soll
3. Den folgenden Code in den HTML-Block einfügen und `VideoID` durch die kopierte ID ersetzen: `<div class="youtube-player" data-id="VideoID"></div>` (=> `<div class="youtube-player" data-id="dQw4w9WgXcQ"></div>`)

Es empfiehlt sich, den fertigen HTML-Block mit dem eingebetteten Video [als Snippet zu speichern](https://ghost.org/help/snippets/), um den benötigten Code nicht jedes Mal in dieser Dokumentation nachlesen zu müssen.

# Sitemap für Google News

Dieses Theme kann [mit Google News kompatible Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap) generieren. Einfach eine Route mit der Sitemap-Vorlage festlegen, wie in der Beispiel-Routendatei gezeigt:

```yaml
routes:
  /sitemap/:
    template: sitemap
    content_type: text/html
```

Danach kann man die [Google Search Console verwenden, um die Sitemap einzureichen](https://support.google.com/webmasters/answer/7451001). In diesem Fall wäre die Sitemap-URL dann `https://your-site.com/sitemap/`.

# Automatische Logo-Generierung

Zur Geschwindigkeitsoptimierung wird empfohlen, das eigene Logo im SVG-Format hochzuladen. Ist dies nicht der Fall, generiert Spectre ein eigenes Logo auf Basis des Website-Titels.

# Entwicklung

Spectre-Themes werden mit Gulp/PostCSS kompiliert. [Node](https://nodejs.org/), [Yarn](https://yarnpkg.com/) und [Gulp](https://gulpjs.com) müssen global installiert sein. Danach aus dem Stammverzeichnis des Themes die folgenden Befehle ausführen:

```bash
# Abhängigkeiten installieren
yarn install

# Entwicklungsserver starten
yarn dev
```

Nun wird mit jedem Speichern eines Stylesheets in `/assets/css/` automatisch ein zusammenhängendes Stylesheet für `/assets/built/` kompiliert.

Der `zip`-Gulp-Task packt das fertige Theme in ein Archiv unter `dist/<theme-name>.zip`.

```bash
# .zip-Datei erstellen
yarn zip
```

# Verwendete PostCSS-Funktionen

- [Autoprefixer](https://github.com/postcss/autoprefixer) – So muss man sich keine Gedanken um spezielle Browser-Präfixe für einige CSS-Features machen.

# Geschwindigkeitsoptimierungen

Spectre bedient sich verschiedener Techniken zur Optimierung der Ladezeiten. Darunter Preloading wichtiger Ressourcen, das Zusammenfassen mehrerer CSS- und JS-Dateien in einzelnen, komprimierten Dateien, kritisches Inline-CSS und der Einbettung wichtiger Icons als SVGs (statt beispielsweise Icon-Fonts).


## Critical Inline CSS

Um die Zeit bis zum [First Contentful Paint](https://web.dev/articles/fcp) zu verkürzen, generiert [penthouse](https://github.com/pocketjoso/penthouse) kritisches CSS für die Post-, Page-, Tag- und Index-Seiten. Eingebunden werden die jeweiligen Dateien über Handlebars-Partials (siehe [default.hbs](default.hbs#L11) bzw. [partials/components/inline-css.hbs](partials/components/inline-css.hbs)).

Mit `yarn critical` können diese Inline-Styles manuell neu generiert werden.

## SVG-Icons

Sprectre verwendet inline SVG-Icons, die über Handlebars-Partials eingebunden werden. Alle Icons befinden sich in `/partials/icons`. Um ein Icon zu verwenden, einfach den Namen der entsprechenden Datei einbinden, z.B. Um das SVG-Icon in `/partials/icons/rss.hbs` einzubinden - `{{> "icons/rss"}}` verwenden. Weitere Icons können auf die gleiche Weise hinzugefügt werden.

# Copyright & Lizenz

Copyright (c) 2013–2023 [Ghost Foundation](https://ghost.org); 2023–2024 [Jannis Hutt](https://hutt.io). Dieses Theme basiert auf [Source](https://github.com/TryGhost/Source) der [Ghost Foundation](https://ghost.org) und wird ebenfalls unter der [MIT-Lizenz](LICENSE) veröffentlicht.
