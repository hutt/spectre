# Spectre

A spectre is haunting Europe. This is it's corresponding theme. Ghost theme for DIE LINKE blogs.

&nbsp;

![image](https://user-images.githubusercontent.com/120485/49293031-7276b000-f4e1-11e8-8b71-43dc53c67f00.png)


&nbsp;

# First time using a Ghost theme?

Ghost uses a simple templating language called [Handlebars](http://handlebarsjs.com/) for its themes.

We've documented our default theme pretty heavily so that it should be fairly easy to work out what's going on just by reading the code and the comments. Once you feel comfortable with how everything works, we also have full [theme API documentation](https://themes.ghost.org) which explains every possible Handlebars helper and template.

**The main files are:**

- `default.hbs` - The main template file
- `home.hbs` - Used for the home page
- `index.hbs` - Used for the blog page
- `post.hbs` - Used for individual posts
- `page.hbs` - Used for individual pages
- `tag.hbs` - Used for tag archives

One neat trick is that you can also create custom one-off templates just by adding the slug of a page to a template file. For example:

- `page-about.hbs` - Custom template for the `/about/` page
- `tag-news.hbs` - Custom template for `/tag/news/` archive

# Routes

This website offers a onepager homepage as well as a blog. You'll need to update your routes in order to make the homepage work.

This is the content of the [routes.yaml file](routes.yaml):
```yaml
routes:
  /: 
    template: home
    data: page.start
  /en/:
    template: home-en
    data: page.start-en

collections:
  /blog/:
    permalink: /blog/{slug}/
    template: index
    filter: 'tag:-hash-en'
  /blog/en/:
    permalink: /blog/en/{slug}/
    template: index
    filter: 'tag:hash-en'

taxonomies:
  tag: /tag/{slug}/
```

# Multi-language support
As you can see in the routes file, this theme supports posts and pages in multiple languages. 

## Posting in another language
If you usually blog in German, but you want to publish a post in English, simply tag the post with the internal tag `#en`. Posts with this internal tag won't be displayed in the posts archive on `yourdomain.tld/blog/`, but under `yourdomain.tld/en/blog/`.

## Pages in another language
To publish a page in another language, simply note its slug and create an additional route in the `routes.yaml` file. The example above features an additional homepage in English. While the German home page's slug is `start`, the english page's slug is `start-en`. It will then be displayed under `yourdomain.tld/en/`. It's as easy as that.
