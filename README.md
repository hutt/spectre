# Spectre

![Header Graphic](/assets/readme-header.png)

A spectre is haunting Europe. This is its website's theme. 👻 [Ghost](https://github.com/TryGhost/Ghost) theme for websites and blogs affiliated with Die Linke.

# Demo
- [spectre.hutt.io](spectre.hutt.io)
- [inesschwerdtner.eu](https://inesschwerdtner.eu)
- [felixschulz.eu](https://felixschulz.eu)


# Mockup & Screenshots

![Theme Mockups](/assets/mockups.png)

|[Live Demo](https://spectre.hutt.io/)|[Download](https://github.com/hutt/spectre/releases/)|
|---|---|

Screenshots of [inesschwerdtner.eu](https://inesschwerdtner.eu), where the new theme version is rolled out already.
| Page | Desktop | Mobile |
| ---- | ------- | ------ |
| Homepage Dunkelrot | ![homepage-desktop 1](/assets/screenshots/homepage-desktop-2.png) | ![homepage-mobile 1](/assets/screenshots/homepage-mobile-2.jpeg) |
| Homepage Dunkelgrün | ![homepage-desktop 2](/assets/screenshots/homepage-desktop-1.png) | ![homepage-mobile 2](/assets/screenshots/homepage-mobile-1.jpeg) |
| Blog | ![blog-desktop](/assets/screenshots/blog-desktop.png) | ![blog-mobile](/assets/screenshots/blog-mobile.jpeg) |
| Blogpost | ![post-desktop](/assets/screenshots/post-desktop.png) | ![post-mobile](/assets/screenshots/post-mobile.jpeg) |

# First time using a Ghost theme?

Ghost uses a simple templating language called [Handlebars](http://handlebarsjs.com/) for its themes.

We've documented our default theme pretty heavily so that it should be fairly easy to work out what's going on just by reading the code and the comments. Once you feel comfortable with how everything works, we also have full [theme API documentation](https://themes.ghost.org) which explains every possible Handlebars helper and template.

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
  /blog/:
    permalink: /blog/{slug}/
    template: home
    filter: 'tag:-hash-pressemitteilung+tag:-hash-termin'
  /presse/mitteilungen/:
    permalink: /presse/mitteilungen/{year}/{slug}/
    template: search-pressemitteilungen
    filter: 'tag:hash-pressemitteilung'
  /termine/archiv/:
    permalink: /termine/{year}/{slug}/
    template: search-termine
    filter: 'tag:hash-termin'

taxonomies:
  tag: /tag/{slug}/
  author: /autor_in/{slug}/

```

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

- Autoprefixer - Don't worry about writing browser prefixes of any kind, it's all done automatically with support for the latest 2 major versions of every browser.

# Blazing fast
Critical CSS served inline. Execute `yarn critical` to re-generate.

# SVG Icons

Sprectre uses inline SVG icons, included via Handlebars partials. You can find all icons inside `/partials/icons`. To use an icon just include the name of the relevant file, eg. To include the SVG icon in `/partials/icons/rss.hbs` - use `{{> "icons/rss"}}`.

You can add your own SVG icons in the same manner.

# Copyright & License
Copyright (c) 2013-2023 [Ghost Foundation](https://ghost.org); 2023 [Jannis Hutt](https://hutt.io). This theme is based on [Ghost Foundation](https://ghost.org)'s theme [Source](https://github.com/TryGhost/Source) and released under the [MIT license](LICENSE).