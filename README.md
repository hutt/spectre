# Spectre

[![de](https://img.shields.io/badge/lang-de-blue.svg)](README.de.md)

![Header Graphic](/assets/readme-header.png)

A spectre is haunting Europe. This is its website's theme. 👻 [Ghost](https://github.com/TryGhost/Ghost) theme for websites and blogs affiliated with Die Linke.

# Demo

- [spectre.hutt.io](spectre.hutt.io)
- [Ines Schwerdtner](https://inesschwerdtner.de)
- [BAG Betrieb und Gewerkschaft](https://betriebundgewerkschaft.de)

# Mockup & Screenshots

![Theme Mockup](/assets/mockup-inesschwerdtner.de.png)

|[Live Demo](https://spectre.hutt.io/)|[Download](https://github.com/hutt/spectre/releases/)|
|---|---|

# First time using a Ghost theme?

Ghost uses a simple templating language called [Handlebars](http://handlebarsjs.com/) for its themes.

**The main files are:**

- `default.hbs` - The parent template file, which includes your global header/footer
- `home.hbs` - The homepage
- `index.hbs` - The main template to generate a list of posts
- `post.hbs` - The template used to render individual posts
- `page.hbs` - Used for individual pages
- `tag.hbs` - Used for tag archives, eg. "all posts tagged with `news`"
- `author.hbs` - Used for author archives, eg. "all posts written by Jamie"

One neat trick is that you can also create custom one-off templates by adding the slug of a page to a template file. For example:

- `page-about.hbs` - Custom template for an `/about/` page
- `tag-news.hbs` - Custom template for `/tag/news/` archive
- `author-ines.hbs` - Custom template for `/author/ines/` archive

# Routes

This website offers a onepager homepage as well as a blog. You'll need to update your routes in order to make the homepage work.

This is how your [routes.yaml file](routes.yaml) could look like:

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

Caution: **Collections must be specified in the correct order.** Posts that have already been assigned to the previously mentioned collection with a filter (e.g. all with the tag `#termin` or `hash-termin` (as you would write it in the routes file)) cannot be part of the subsequent collections (e.g. `/blog/`). Therefore, a filter that excludes press releases and events no longer needs to be specified for `/blog/`.

Example: If the collection `/blog/` in the example above were defined above the collection `/termine/archiv/` (with the filter `#termin` or `hash-termin`), the appointments collection would be completely empty because the posts specified with the filter have already been assigned to another collection.

More information about collections can be found [in the official documentation](https://ghost.org/tutorials/content-collections/).

# Events and Press Releases

As you can see in the `routes.yaml` example code, this theme supports custom pages for events and press releases. This way, those kinds of posts don't clutter the blog index view.

## Events

### Add the event collection to your routes.yaml file

Add the following lines to the collection object inside `routes.yaml`:

```yaml
collections:
  /termine/archiv/:
    permalink: /termine/{year}/{slug}/
    template: search-termine
    filter: 'tag:hash-termin'
```

### Create an event page

Simply create a page using the editor, name it (e.g. "Events") and fill it with additional information. Now, select the page template named `Termine` in the page options sidebar. From now on, the page displays the 5 latest events on its bottom.

### Create a new event

To add an event, simply create a new post and fill in the event information. It's recommended to put the event date in the title. Now tag your event post with the internal tag `#termin`. This ensures the event isn't displayed in the main blog index and only on the event page (as well as the event archive page).

## Press Releases

### Add the press releases collection to your routes.yaml file

Add the following lines to the collection object inside `routes.yaml`:

```yaml
collections:
  /presse/mitteilungen/:
    permalink: /presse/mitteilungen/{year}/{slug}/
    template: search-pressemitteilungen
    filter: 'tag:hash-pressemitteilung'
```

### Create a press page

Simply create a page using the editor, name it (e.g. "Presse") and fill it with additional information. Now, select the page template named `Presse` in the page options sidebar. From now on, the page displays the 5 latest press releases on its bottom.

### Create a new press release

To add a press release, simply create a new post. Now tag your event post with the internal tag `#pressemitteilung`. This ensures the event isn't displayed in the main blog index and only on the press releases page (as well as the press releases archive page).

# Privacy-friendly YouTube video embeds

This Theme allows privacy-friendly and GDPR-compliant YouTube video embeds using [light-yt.js](https://www.labnol.org/internet/light-youtube-embeds/27941/) by [Amit Agarwal](https://github.com/labnol). 

## How to embed a video

1. Copy the YouTube video ID (if the video URL is `https://www.youtube.com/watch?v=dQw4w9WgXcQ`, the ID is `dQw4w9WgXcQ`)
2. Inside the editor, insert an HTML block where you want to place the video
3. Paste the following code into the HTML block and replace `VideoID` with the ID you copied: `<div class="youtube-player" data-id="VideoID"></div>` (=> `<div class="youtube-player" data-id="dQw4w9WgXcQ"></div>`)

It is recommended to save the finished HTML block with the embedded video [as a snippet](https://ghost.org/help/snippets/) so that you do not have to look up the required code the next time.

# Sitemap for Google News

This theme can generate [sitemaps compatible with Google News](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap). Just set a route using the sitemap template like it's shown in the example routes file:

```yaml
routes:
  /sitemap/:
    template: sitemap
    content_type: text/html
```

After that, you can [use Google Search Console to submit your sitemap](https://support.google.com/webmasters/answer/7451001). In this case, the sitemap URL would be `https://your-site.com/sitemap/`.

# Automatic Logo Generation

For speed optimization, it is recommended to upload your own logo in SVG format. However, if this is not the case, Spectre generates a logo based on the site's title.

# Development

Spectre styles are compiled using Gulp/PostCSS to polyfill future CSS spec. You'll need [Node](https://nodejs.org/), [Yarn](https://yarnpkg.com/) and [Gulp](https://gulpjs.com) installed globally. After that, from the theme's root directory:

```bash
# install dependencies
yarn install

# run development server
yarn dev
```

Now you can edit `/assets/css/` files, which will be compiled to `/assets/built/` automatically.

The `zip` Gulp task packages the theme files into `dist/<theme-name>.zip`, which you can then upload to your site.

```bash
# create .zip file
yarn zip
```

# PostCSS Features Used

- [Autoprefixer](https://github.com/postcss/autoprefixer) - Don't worry about writing browser prefixes of any kind, it's all done automatically with support for the latest 2 major versions of every browser.

# Blazing fast
Spectre employs various techniques to optimize loading times. These include preloading important resources, combining multiple CSS and JS files into single, compressed files, critical inline CSS, and embedding important icons as SVGs (instead of e.g. icon fonts).

## Critical Inline CSS

This theme uses [penthouse](https://github.com/pocketjoso/penthouse) to generate inline CSS for the post, page, tag, and index pages. This reduces the time to [First Contentful Paint](https://web.dev/articles/fcp) dramatically. The respective inline CSS files are included via Handlebars partials (see [default.hbs](default.hbs#L11) and [partials/components/inline-css.hbs](partials/components/inline-css.hbs)).

Inline styles can be manually regenerated using `yarn critical`.

## SVG Icons

Spectre uses inline SVG icons, which are included via Handlebars partials. All icons are located in `/partials/icons`. To use an icon, simply include the name of the corresponding file, e.g., to include the SVG icon in `/partials/icons/rss.hbs`, use `{{> "icons/rss"}}`.

Additional SVG icons can be added in the same manner.

# Eliminating Third-Party Requests Completely

In the default configuration, both [Ghost](https://github.com/TryGhost/Ghost/blob/2f09dd888024f143d28a0d81bede1b53a6db9557/PRIVACY.md) and [light-yt.js](https://www.labnol.org/internet/light-youtube-embeds/27941/) (the plugin I use for privacy-friendly YouTube embeds) make requests to third parties. From a data protection perspective, these are unproblematic. However, they can be circumvented as well.

## JSDelivr Requests (Ghost)

For the portal, search, and (if activated) the comments function, Ghost includes scripts and stylesheets from JSDelivr. However, it is also possible to specify custom URLs in the configuration file `config.[env].json` (👉 [official documentation](https://ghost.org/docs/config/#privacy)).

I have written [a Cloudflare Worker](https://gist.github.com/hutt/7b3c254a995849e6a06709a872840685) that proxies and caches requests to JSDelivr. If you make this available via the route `my-ghost-website.com/cdn-jsdelivr/*`, under the same domain as the Ghost instance, third-party requests can be avoided. In this case, you would only need to extend the configuration file with the following lines:

```json
{
  "url": "http://localhost:2368",
  "server": {
    "port": 2368,
    "host": "::"
  },
  [...]
  "portal": {
    "url": "/cdn-jsdelivr/npm/@tryghost/portal@~{version}/umd/portal.min.js"
  },
  "sodoSearch": {
      "url": "/cdn-jsdelivr/npm/@tryghost/sodo-search@~{version}/umd/sodo-search.min.js",
      "styles": "/cdn-jsdelivr/npm/@tryghost/sodo-search@~{version}/umd/main.css"
  },
  "comments": {
      "url": "/cdn-jsdelivr/npm/@tryghost/comments-ui@~{version}/umd/comments-ui.min.js",
      "styles": "/cdn-jsdelivr/npm/@tryghost/comments-ui@~{version}/umd/main.css"
  }
  [...]
}
```

## Requests to YouTube (light-yt.js)

When you access a page with a YouTube video embedded using light-yt.js, the plugin makes two requests:

- A JSON object with information about the embedded video is retrieved from `https://www.youtube-nocookie.com`
- The thumbnail is loaded from `https://i.ytimg.com`

These requests can also be proxied using a [Cloudflare Worker](https://gist.github.com/hutt/62e9355afb0d4ff0eeecd39bc51652de). If you make the worker available using a route, e.g., `my-ghost-website.com/yt-proxy/*` (under the same domain as the Ghost instance), you can specify the alternative URLs for loading this data using a script tag in the global site header:

```html
<script>
  // load YouTube video data via proxy
  const YT_DATA_URL_PREFIX = "/yt-proxy/data";
  // load YouTube Thumbnails via proxy
  const YT_THUMBNAIL_URL_PREFIX = "/yt-proxy/thumbnail";
</script>
```

# Copyright & License

Copyright (c) 2013–2023 [Ghost Foundation](https://ghost.org); 2023–2024 [Jannis Hutt](https://hutt.io). This theme is based on [Ghost Foundation](https://ghost.org)'s theme [Source](https://github.com/TryGhost/Source) and released under the [MIT license](LICENSE).
